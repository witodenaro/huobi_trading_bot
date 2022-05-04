import {
  LONG_STOP_LOSS_DEVIATION,
  CONSERVATIVE_LONG_STOP_LOSS_DEVIATION,
  CONSERVATIVE_SHORT_STOP_LOSS_DEVIATION,
  INTERMEDIATE_SHORT_STOP_LOSS_DEVIATION,
  INTERMEDIATE_STOP_LOSS_BREAKPOINT,
  CONSERVATIVE_STOP_LOSS_BREAKPOINT,
  INTERMEDIATE_LONG_STOP_LOSS_DEVIATION,
  SHORT_STOP_LOSS_DEVIATION,
} from "./trader.data";
import {
  OrderFeedee,
  OrderListener,
  OrderNotification,
  PriceFeedee,
  PriceListener,
} from "../feedees/types";
import {
  calculateEqualAmount,
  calculatePercentageDifference,
  calculateStopLoss,
} from "../utils/calculator";
import { Long } from "../puppets/Long";
import { Short } from "../puppets/Short";

import { log } from "../utils/logger";
import { ContractCode } from "../types/order";
import {
  AccountInfo,
  getAccountPositionsOrders,
  getHasEnoughBalance,
} from "../utils/initializer";
import { cancelAllStopLossTakeProfit } from "../api/linear-swap-api/v1/swap_tpsl_cancelall";
import { PositionState } from "../puppets/Position";
import { getPrecision } from "../utils/number";

export class Trader {
  private long: Long | null = null;
  private short: Short | null = null;

  private _priceChangeHandler: PriceListener | null = null;
  private _orderUpdateHandler: OrderListener | null = null;

  constructor(
    private _contractCode: ContractCode,
    private _priceFeedee: PriceFeedee,
    private _orderFeedee: OrderFeedee
  ) {
    this._priceChangeHandler = this.handlePriceChange.bind(this);
    this._orderUpdateHandler = this.handleOrderUpdate.bind(this);
  }

  async init() {
    const accountPositionsOrders = await getAccountPositionsOrders(
      this._contractCode
    );

    await cancelAllStopLossTakeProfit({ contract_code: this._contractCode });

    const hasEnoughBalance = this.checkHasEnoughBalance(accountPositionsOrders);
    const {
      margin_available,
      short,
      long,
      hasOpenPositionsOrAndOrders,
      adjust_factor,
    } = accountPositionsOrders;

    if (short) {
      await this.syncShort(
        short.entryPrice,
        short.amount,
        short.state,
        short.orderId
      );
    }

    if (long) {
      await this.syncLong(
        long.entryPrice,
        long.amount,
        long.state,
        long.orderId
      );
    }

    if (!hasOpenPositionsOrAndOrders && !hasEnoughBalance) {
      throw new Error(
        `${this._contractCode} trader can't open new positions due to unsufficient balance`
      );
    }

    if (!hasOpenPositionsOrAndOrders && hasEnoughBalance) {
      const latestPrice = this.getLatestPrice();
      await this.openPositions(latestPrice, margin_available, adjust_factor);
    }

    this._priceFeedee.addListener(this._priceChangeHandler as PriceListener);
    this._orderFeedee.addListener(this._orderUpdateHandler as OrderListener);
  }

  checkHasEnoughBalance({ margin_available, adjust_factor }: AccountInfo) {
    const latestPrice = this.getLatestPrice();

    return getHasEnoughBalance(margin_available, latestPrice, adjust_factor);
  }

  getLatestPrice() {
    const latestPrice = this._priceFeedee.getLatestPrice();

    if (!latestPrice) {
      throw new Error(
        `${this._contractCode} trader was initialized before first price is fetched`
      );
    }

    return latestPrice;
  }

  async syncShort(
    price: number,
    amount: number,
    state: PositionState,
    orderId?: string
  ) {
    const stopLoss = calculateStopLoss(price, SHORT_STOP_LOSS_DEVIATION);
    this.short = Short.fromExisting(
      this._contractCode,
      price,
      amount,
      state,
      orderId
    );
    await this.short.placeStopLoss(stopLoss);
    log(`${this._contractCode} trader syncs with existing SHORT position.`);
    log(
      `${this._contractCode} POS: Entry price - ${price}, amount - ${amount}, state - ${state}`
    );
  }

  async syncLong(
    price: number,
    amount: number,
    state: PositionState,
    orderId?: string
  ) {
    const stopLoss = calculateStopLoss(price, LONG_STOP_LOSS_DEVIATION);
    this.long = Long.fromExisting(
      this._contractCode,
      price,
      amount,
      state,
      orderId
    );
    await this.long.placeStopLoss(stopLoss);
    log(`${this._contractCode} trader syncs with existing LONG position.`);
    log(
      `${this._contractCode} POS: Entry price - ${price}, amount - ${amount}, state - ${state}`
    );
  }

  async openShort(price: number, amount: number) {
    const stopLoss = calculateStopLoss(price, SHORT_STOP_LOSS_DEVIATION);
    this.short = new Short(this._contractCode, price, amount, stopLoss);
    await this.short.open();
  }

  async openLong(price: number, amount: number) {
    const stopLoss = calculateStopLoss(price, LONG_STOP_LOSS_DEVIATION);
    this.long = new Long(this._contractCode, price, amount, stopLoss);
    await this.long.open();
  }

  async openPositions(
    price: number,
    marginAvailable: number,
    adjust_factor: number
  ) {
    const amount = calculateEqualAmount(
      price,
      marginAvailable,
      getPrecision(adjust_factor)
    );

    const openShortPromise = this.openShort(price, amount);
    const openLongPromise = this.openLong(price, amount);

    log(
      `${this._contractCode} trader opens new positions at ${price} of ${amount} amount`
    );
    await Promise.all([openLongPromise, openShortPromise]);
  }

  async handleAllPositionsAreClosed() {
    const accountPositionsOrders = await getAccountPositionsOrders(
      this._contractCode
    );

    const hasEnoughBalance = this.checkHasEnoughBalance(accountPositionsOrders);
    const { margin_available, hasOpenPositionsOrAndOrders, adjust_factor } =
      accountPositionsOrders;

    if (hasOpenPositionsOrAndOrders) {
      throw new Error(
        `${this._contractCode} tried to handle all positions closed having a position or orders open`
      );
    }

    if (!hasEnoughBalance) {
      throw new Error(
        `${this._contractCode} trader can't open new positions due to unsufficient balance`
      );
    }

    const latestPrice = this.getLatestPrice();
    await this.openPositions(latestPrice, margin_available, adjust_factor);
  }

  async handlePriceChange(latestPrice: number) {
    await this.updateStopLossesBasedOnPrice(latestPrice);
  }

  async handleOrderUpdate(order: OrderNotification) {
    log(`${this._contractCode} order is updated`, order);
    const longCheckPromise = this.long?.checkOrderUpdate(order);
    const shortCheckPromise = this.short?.checkOrderUpdate(order);

    await Promise.all([longCheckPromise, shortCheckPromise]);

    const shortIsClosedOrNotExists = !this.short || this.short.isClosed();
    const longIsClosedOrNotExists = !this.long || this.long.isClosed();

    const positionsAreClosedOrNotExist =
      shortIsClosedOrNotExists && longIsClosedOrNotExists;

    if (positionsAreClosedOrNotExist) {
      await this.handleAllPositionsAreClosed();
    }
  }

  private async updateStopLossesBasedOnPrice(price: number) {
    if (this.long && this.long.isOpen()) {
      const currentPriceDeviation = calculatePercentageDifference(
        this.long.entryPrice,
        price
      );
      const conservativeStopLoss = calculateStopLoss(
        price,
        CONSERVATIVE_LONG_STOP_LOSS_DEVIATION
      );
      const intermediateStopLoss = calculateStopLoss(
        price,
        INTERMEDIATE_LONG_STOP_LOSS_DEVIATION
      );

      /*
				Depending on the price deviation I use different risk management strategies

				More margin = more space for corrections
			*/
      switch (true) {
        // e.g. Price went up 5% -> set stop loss at -2.5% of the current price
        case currentPriceDeviation > INTERMEDIATE_STOP_LOSS_BREAKPOINT:
          if (this.long.stopLossPrice < intermediateStopLoss) {
            log(`${this._contractCode} long profit is > ${INTERMEDIATE_STOP_LOSS_BREAKPOINT}`);
            log(
              `${this._contractCode} long: stop loss is set to 
              ${INTERMEDIATE_LONG_STOP_LOSS_DEVIATION}% - ${intermediateStopLoss} USDT`
            );
            await this.long.updateStopLoss(intermediateStopLoss);
          }
          break;

        // e.g. Price went up 2% -> set stop loss at -1% of the current price
        case currentPriceDeviation > CONSERVATIVE_STOP_LOSS_BREAKPOINT:
          if (this.long.stopLossPrice < conservativeStopLoss) {
            log(`${this._contractCode} long profit is > ${CONSERVATIVE_STOP_LOSS_BREAKPOINT}`);
            log(
              `${this._contractCode} long: stop loss is set to 
              ${CONSERVATIVE_LONG_STOP_LOSS_DEVIATION}% - ${conservativeStopLoss} USDT`
            );
            await this.long.updateStopLoss(conservativeStopLoss);
          }
          break;
        default:
          break;
      }
    }

    // Short is the only position left
    if (this.short && this.short.isOpen()) {
      const currentPriceDeviation = calculatePercentageDifference(
        this.short.entryPrice,
        price
      );
      const conservativeStopLoss = calculateStopLoss(
        price,
        CONSERVATIVE_SHORT_STOP_LOSS_DEVIATION
      );
      const intermediateStopLoss = calculateStopLoss(
        price,
        INTERMEDIATE_SHORT_STOP_LOSS_DEVIATION
      );

      /*
				Depending on the price deviation I use different risk management strategies

				More margin = more space for corrections
			*/
      switch (true) {
        // e.g. Price went down 5% -> set stop loss at +2.5% of the current price
        case currentPriceDeviation < -INTERMEDIATE_STOP_LOSS_BREAKPOINT:
          if (this.short.stopLossPrice > intermediateStopLoss) {
            log(`${this._contractCode} short profit is > ${INTERMEDIATE_STOP_LOSS_BREAKPOINT}`);
            log(
              `${this._contractCode} short: stop loss is set to 
              -${INTERMEDIATE_SHORT_STOP_LOSS_DEVIATION}% - ${intermediateStopLoss} USDT`
            );
            await this.short.updateStopLoss(intermediateStopLoss);
          }
          break;

        // e.g. Price went down 2% -> set stop loss at +1% of the current price
        case currentPriceDeviation < -CONSERVATIVE_STOP_LOSS_BREAKPOINT:
          if (this.short.stopLossPrice > conservativeStopLoss) {
            log(`${this._contractCode} short profit is > ${CONSERVATIVE_STOP_LOSS_BREAKPOINT}`);
            log(
              `${this._contractCode} short: stop loss is set to 
              -${CONSERVATIVE_SHORT_STOP_LOSS_DEVIATION}% - ${conservativeStopLoss} USDT`
            );
            await this.short.updateStopLoss(conservativeStopLoss);
          }
          break;
        default:
          break;
      }
    }
  }
}
