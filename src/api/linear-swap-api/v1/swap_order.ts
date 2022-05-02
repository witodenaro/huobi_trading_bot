import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import {
	ContractCode,
	NumberBool,
	Direction,
	OrderOffset,
	OrderPriceType,
} from "../../../types/order";

interface Response {
	code: number;
	data: {
		order_id: number;
		order_id_str: string;
	};
}

type Params = {
	contract_code: ContractCode;
	reduce_only?: NumberBool;
	client_order_id?: number; // client-specified ids
	price?: number;
	volume: number; // number of orders
	amount: number; // amount to buy/sell
	direction: Direction;
	offset?: OrderOffset;
	lever_rate: number;
	order_price_type: OrderPriceType;
	tp_trigger_price?: number;
	tp_order_price?: number;
	tp_order_price_type?: OrderPriceType;
	sl_trigger_price?: number;
	sl_order_price?: number;
	sl_order_price_type?: OrderPriceType;
};

export const placeOrder = ({ ...params }: Params) =>
	request({
		method: "POST",
		path: "/linear-swap-api/v1/swap_order",
		baseUrl: config.FUTURES_BASE_URL,
		body: params,
	}) as Promise<AxiosResponse<Response>>;
