import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import { ContractCode, Direction, OrderPriceType } from "../../../types/order";
import { ResponseStatus } from "../../../types/requests";

export interface Order {
  order_id: number;
  order_id_str: string;
}

interface Response {
	status: ResponseStatus;
	data: {
		tp_order: Order | null;
		sl_order: Order | null;
	};
	ts: number;
}

type Params = {
	contract_code: ContractCode;
	volume: number; // number of orders (always 1)
	amount: number; // amount to buy/sell (e.g. 0.01 ETH)

	direction: Direction; 
  // BUY -> Stop Loss for Short
  // SELL -> Stop Loss for Long

	tp_trigger_price?: number;
	tp_order_price?: number;
	tp_order_price_type?: OrderPriceType;
	sl_trigger_price?: number;
	sl_order_price?: number;
	sl_order_price_type?: OrderPriceType;
};

export const placeStopLossTakeProfit = ({ ...params }: Params) =>
	request({
		method: 'POST',
		path: '/linear-swap-api/v1/swap_tpsl_order',
		baseUrl: config.FUTURES_BASE_URL,
		body: params,
	}) as Promise<AxiosResponse<Response>>;
