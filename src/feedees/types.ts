import { connection } from "websocket";
import { PriceMessage } from "../connection/spot/types";
import { OrderNotificationMessage } from "../connection/usdt-m/types";
import { ContractCode, OrderSource, OrderStatus } from "../types/order";

export type OrderNotification = {
	order_id_str: string;
	client_order_id: number | null;
	status: OrderStatus;
	order_source: OrderSource;
};

export type Listener<T> = (value: T) => void;
export type PriceListener = Listener<number>;
export type OrderListener = Listener<OrderNotification>;

export interface Feedee<T, V> {
	channel: string;
	init: (connection: connection) => void;
	handleMessage: (message: T) => void;
	addListener: (listener: Listener<V>) => void;
	removeListener: (listener: Listener<V>) => void;
}

export interface PriceFeedee extends Feedee<PriceMessage, number> {
	getLatestPrice: () => number | null;
}

export interface OrderFeedee
	extends Feedee<OrderNotificationMessage, OrderNotification> {
	contractCode: ContractCode;
	id: string;
}
