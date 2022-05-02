import { Direction } from 'readline';
import { OrderFeedee } from '../../feedees/types';
import {
	ContractCode,
	MarginAccount,
	MarginMode,
	NumberBool,
	OrderLiquidationType,
	OrderOffset,
	OrderPriceType,
	OrderSource,
	OrderStatus,
	OrderType,
	Role,
} from '../../types/order';

export type PingMessage = {
	op: 'ping';
	ts: string;
};

type ErrorAuthMessage = {
	op: 'auth';
	type: 'api';
	ts: number;
	'err-code': number;
	'err-msg': string;
};

type SuccessAuthMessage = {
	ts: number;
	op: 'auth';
	type: 'api';
	'err-code': 0;
	data: { 'user-id': string };
};

type Trade = {
	trade_fee: number;
	fee_asset: Symbol;
	real_profit: number;
	profit: number;
	trade_id: number;
	id: string;
	trade_volume: number;
	trade_price: number;
	trade_turnover: number;
	created_at: number;
	role: Role;
};

export type OrderNotificationMessage = {
	op: 'notify';
	topic: string;
	ts: number;
	symbol: Symbol;
	contract_code: ContractCode;
	volume: number;
	price: number;
	order_price_type: OrderPriceType;
	direction: Direction;
	offset: OrderOffset;
	status: OrderStatus;
	lever_rate: number;
	order_id: number;
	order_id_str: string;
	client_order_id: number | null;
	order_source: OrderSource;
	order_type: OrderType;
	created_at: number;
	trade_volume: number;
	trade_turnover: number;
	fee: number;
	trade_avg_price: number;
	margin_frozen: number;
	profit: number;
	trade: Trade[];
	canceled_at: number;
	fee_asset: Symbol;
	margin_asset: Symbol;
	uid: string;
	liquidation_type: OrderLiquidationType;
	margin_mode: MarginMode;
	margin_account: MarginAccount;
	is_tpsl: NumberBool;
	real_profit: number;
	trade_partition: Symbol;
	reduce_only: NumberBool;
};

export type SubMessage = {
	op: 'sub',
  cid: string,
  topic: string,
  ts: number,
  'err-code': 0
}

export type AuthMessage = SuccessAuthMessage | ErrorAuthMessage;

export type Message = PingMessage | AuthMessage | OrderNotificationMessage | SubMessage;

export type SocketMessage = {
	type: 'binary';
	binaryData: Buffer;
};

export type FeedeesHash = Record<ContractCode, OrderFeedee>;
