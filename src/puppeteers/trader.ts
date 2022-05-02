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
import { getAssetsAndPositions } from "../api/linear-swap-api/v1/swap_account_position_info";
import { getHasEnoughBalance, searchForInitInfo } from "../utils/initializer";
import { cancelAllStopLossTakeProfit } from "../api/linear-swap-api/v1/swap_tpsl_cancelall";

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
		const res = await getAssetsAndPositions({
			contract_code: this._contractCode,
		});

		const initialInfo = searchForInitInfo(res.data.data);

		if (!initialInfo) {
			throw new Error(
				`${this._contractCode} trader contract account is funds-empty.`
			);
		}

		const { margin_available, short, long, hasOpenPositions, adjust_factor } =
			initialInfo;

		await cancelAllStopLossTakeProfit({ contract_code: this._contractCode });

		const latestPrice = this._priceFeedee.getLatestPrice();

		if (!latestPrice) {
			throw new Error(
				`${this._contractCode} trader was initialized before first price was fetched`
			);
		}

		const hasEnoughMargin = getHasEnoughBalance(
			margin_available,
			latestPrice,
			adjust_factor
		);

		if (!hasOpenPositions && !hasEnoughMargin) {
			throw new Error(
				`${this._contractCode} trader can't open new positions due to unsufficient balance`
			);
		}

		if (short) {
			await this.syncShort(short.entryPrice, short.amount);
		}

		if (long) {
			await this.syncLong(long.entryPrice, long.amount);
		}

		if (!hasOpenPositions && hasEnoughMargin) {
			await this.openPositions(latestPrice, margin_available);
		}

		this._priceFeedee.addListener(this._priceChangeHandler as PriceListener);
		this._orderFeedee.addListener(this._orderUpdateHandler as OrderListener);
	}

	async syncShort(price: number, amount: number) {
		const stopLoss = calculateStopLoss(price, SHORT_STOP_LOSS_DEVIATION);
		this.short = Short.fromExisting(this._contractCode, price, amount);
		await this.short.placeStopLoss(stopLoss);
		log(
			`${this._contractCode} trader syncs existing short position opened at ${price} of ${amount} amount`
		);
	}

	async syncLong(price: number, amount: number) {
		const stopLoss = calculateStopLoss(price, LONG_STOP_LOSS_DEVIATION);
		this.long = Long.fromExisting(this._contractCode, price, amount);
		await this.long.placeStopLoss(stopLoss);
		log(
			`${this._contractCode} trader syncs existing long position opened at ${price} of ${amount} amount`
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

	async openPositions(price: number, marginAvailable: number) {
		const amount = calculateEqualAmount(price, marginAvailable);

		const openShortPromise = this.openShort(price, amount);
		const openLongPromise = this.openLong(price, amount);

		log(
			`${this._contractCode} trader opens new positions at ${price} of ${amount} amount`
		);
		await Promise.all([openLongPromise, openShortPromise]);
	}

	async handlePriceChange(latestPrice: number) {
		await this.updateStopLossesBasedOnPrice(latestPrice);
	}

	handleOrderUpdate(order: OrderNotification) {
		this.long?.checkOrderUpdate(order);
		this.short?.checkOrderUpdate(order);
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
						await this.long.updateStopLoss(intermediateStopLoss);
					}
					break;

				// e.g. Price went up 2% -> set stop loss at -1% of the current price
				case currentPriceDeviation > CONSERVATIVE_STOP_LOSS_BREAKPOINT:
					if (this.long.stopLossPrice < conservativeStopLoss) {
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
						await this.short.updateStopLoss(intermediateStopLoss);
					}
					break;

				// e.g. Price went down 2% -> set stop loss at +1% of the current price
				case currentPriceDeviation < -CONSERVATIVE_STOP_LOSS_BREAKPOINT:
					if (this.short.stopLossPrice > conservativeStopLoss) {
						await this.short.updateStopLoss(conservativeStopLoss);
					}
					break;
				default:
					break;
			}
		}
	}
}
