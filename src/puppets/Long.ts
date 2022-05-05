import { Position, PositionState } from "./Position";
import { placeOrder } from "../api/linear-swap-api/v1/swap_order";
import { placeStopLossTakeProfit } from "../api/linear-swap-api/v1/swap_tpsl_order";
import {
  ContractCode,
  Direction,
  OrderOffset,
  OrderPriceType,
} from "../types/order";
import { ResponseStatus } from "../types/requests";

export class Long extends Position {
  static fromExisting(
    contractCode: ContractCode,
    price: number,
    volume: number,
    state: PositionState,
    orderId?: string
  ): Long {
    const long = new this(contractCode, price, volume, 0, state);
    long.orderId = orderId || null;
    return long;
  }

  async _placeOrder(): Promise<void> {
    const response = await placeOrder({
      contract_code: this.contractCode,
      price: this.entryPrice,
      volume: this.volume,
      lever_rate: 1,
      direction: Direction.BUY,
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
      volume: this.volume,
      direction: Direction.SELL,
      sl_order_price_type: OrderPriceType.OPTIMAL_5,
      sl_trigger_price: price,
      sl_order_price: price,
    });

    if (response.data.status === ResponseStatus.OK) {
      const { sl_order } = response.data.data;

      this.setStopLoss(sl_order);
      this.stopLossPrice = price;
    } else {
      throw new Error(response.data.err_msg);
    }
  }
}
