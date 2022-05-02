import {
	LONG_STOP_LOSS_DEVIATION,
	SHORT_STOP_LOSS_DEVIATION,
	CONSERVATIVE_LONG_STOP_LOSS_DEVIATION,
	CONSERVATIVE_SHORT_STOP_LOSS_DEVIATION,
  INTERMEDIATE_SHORT_STOP_LOSS_DEVIATION,
  INTERMEDIATE_STOP_LOSS_BREAKPOINT,
  CONSERVATIVE_STOP_LOSS_BREAKPOINT,
  INTERMEDIATE_LONG_STOP_LOSS_DEVIATION,
} from './trader.data';
import { Feedee, PriceListener } from '../feedees/types';
import { Position } from '../puppets/Position';
import { calculatePercentageDifference, calculateStopLoss } from '../utils/calculator';
import { log } from '../utils/logger';

export class Trader {
  private profit: number = 0;
	private long: Position | null = null;
	private short: Position | null = null;
	private _priceChangeHandler: PriceListener | null = null;

	constructor(private _priceFeedee: Feedee) {
		this._priceChangeHandler = this.handlePriceChange.bind(this);
		this._priceFeedee.addListener(this._priceChangeHandler);
	}

	openPositions(price: number) {
		this.long = new Position(price, calculateStopLoss(price, LONG_STOP_LOSS_DEVIATION));
		this.short = new Position(price, calculateStopLoss(price, SHORT_STOP_LOSS_DEVIATION));

		this.long.open();
		this.short.open();
	}

	handlePriceChange(latestPrice: number) {
		if (!this.long && !this.short) {
      log(`Opened positions at ${latestPrice} USDT`);
			this.openPositions(latestPrice);
		}

		this.makeActionsBasedOnPrice(latestPrice);
	}

	private makeActionsBasedOnPrice(price: number) {
    this.long && log('Price change: ', Math.floor(calculatePercentageDifference(this.long.entryPrice, price) * 1000) / 1000, '%');

		if (this.long?.isClosed() && this.short?.isClosed()) {
      this.short = null;
      this.long = null;
      log(`Strategy iteration is done at ${price} USDT`);
      log('Total profit:', this.profit * 10)
		}


		if (this.long && this.long.isOpen()) {
			if (this.long.stopLossPrice >= price) {
        log('Long pos is closed');
				this.long.close();
        this.profit += price - this.long.entryPrice;

        if (this.short && this.short.isOpen()) {
					this.short.updateStopLoss(calculateStopLoss(price, CONSERVATIVE_SHORT_STOP_LOSS_DEVIATION));
				}
			}

			// Long is the only position left
			if (this.short && this.short.isClosed()) {
        const currentPriceDeviation = calculatePercentageDifference(this.long.entryPrice, price);
        const conservativeStopLoss = calculateStopLoss(price, CONSERVATIVE_LONG_STOP_LOSS_DEVIATION);
        const intermediateStopLoss = calculateStopLoss(price, INTERMEDIATE_LONG_STOP_LOSS_DEVIATION);
        
        switch (true) {
          case currentPriceDeviation > INTERMEDIATE_STOP_LOSS_BREAKPOINT:
            if (this.long.stopLossPrice < intermediateStopLoss) {
              this.long.updateStopLoss(intermediateStopLoss);
            }
            break;

          case currentPriceDeviation > CONSERVATIVE_STOP_LOSS_BREAKPOINT:
            if (this.long.stopLossPrice < conservativeStopLoss) {
              this.long.updateStopLoss(conservativeStopLoss);
            }
            break;
          default:
            break;
        }
			}
		}

		if (this.short && this.short.isOpen()) {
			if (this.short.stopLossPrice <= price) {
        log('Short pos is closed');
				this.short.close();
        this.profit += this.short.entryPrice - price;

        if (this.long && this.long.isOpen()) {
					this.long.updateStopLoss(calculateStopLoss(price, CONSERVATIVE_LONG_STOP_LOSS_DEVIATION));
				}
			}

      // Short is the only position left
			if (this.long && this.long.isClosed()) {
				const currentPriceDeviation = calculatePercentageDifference(this.short.entryPrice, price);
        const conservativeStopLoss = calculateStopLoss(price, CONSERVATIVE_SHORT_STOP_LOSS_DEVIATION);
        const intermediateStopLoss = calculateStopLoss(price, INTERMEDIATE_SHORT_STOP_LOSS_DEVIATION);
        
        switch (true) {
          case currentPriceDeviation < -INTERMEDIATE_STOP_LOSS_BREAKPOINT:
            if (this.short.stopLossPrice > intermediateStopLoss) {
              this.short.updateStopLoss(intermediateStopLoss);
            }
            break;

          case currentPriceDeviation < -CONSERVATIVE_STOP_LOSS_BREAKPOINT:
            if (this.short.stopLossPrice > conservativeStopLoss) {
              this.short.updateStopLoss(conservativeStopLoss);
            }
            break;
          default:
            break;
        }
			}
		}
	}
}
