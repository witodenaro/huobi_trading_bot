import { placeOrder } from "../api/linear-swap-api/v1/swap_order";
import { placeStopLossTakeProfit } from "../api/linear-swap-api/v1/swap_tpsl_order";
import {
	ContractCode,
	Direction,
	OrderOffset,
	OrderPriceType,
} from "../types/order";
import { Position, PositionState } from "./Position";

export class Short extends Position {
	static fromExisting(
		contractCode: ContractCode,
		price: number,
		amount: number
	): Short {
		return new this(contractCode, price, amount, 0, PositionState.OPEN);
	}

	async _placeOrder(): Promise<void> {
		const response = await placeOrder({
			contract_code: this.contractCode,
			price: this.entryPrice,
			amount: this.amount,
			volume: 1,
			lever_rate: 1,
			direction: Direction.SELL,
			offset: OrderOffset.OPEN,
			order_price_type: OrderPriceType.LIMIT,
		});

		const { order_id_str } = response.data.data;
		this.orderId = order_id_str;
		this.state = PositionState.PENDING;
	}

	async placeStopLoss(price: number): Promise<void> {
		const response = await placeStopLossTakeProfit({
			contract_code: this.contractCode,
			volume: 1,
			direction: Direction.BUY,
			amount: this.amount,
			sl_order_price_type: OrderPriceType.LIMIT,
			sl_order_price: price,
			sl_trigger_price: price,
		});

		console.log(price, response.data);

		const { sl_order } = response.data.data;

		if (!sl_order) {
			throw new Error(
				"Stop loss order wasn't generated after placing stop loss"
			);
		}

		this.stopLossOrder = sl_order;
	}
}
