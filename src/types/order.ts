export enum AssetSymbol {
	BTC = "BTC",
	ETH = "ETH",
	USDT = "USDT",
	XNO = "NANO",
}

export enum MarketSymbol {
	ETHUSDT = "ethusdt",
	BTCUSDT = "bthusdt",
	XNOUSDT = "nanousdt",
}

export enum ContractCode {
	BTC_USDT = "BTC-USDT",
	ETH_USDT = "ETH-USDT",
}

export enum MarginAccount {
	BTC_USDT = "BTC-USDT",
	ETH_USDT = "ETH-USDT",
}

export enum OrderPriceType {
	LIMIT = "limit",
	BBO = "opponent",
	POST_ONLY = "post_only",
	OPTIMAL_5 = "optimal_5",
	OPTIMAL_10 = "optimal_10",
	OPTIMAL_20 = "optimal_20",
}

export enum Direction {
	BUY = "buy",
	SELL = "sell",
}

export enum OrderOffset {
	OPEN = "open",
	CLOSE = "close",
	BOTH = "both",
}

export enum OrderType {
	QUOTATION = 1,
	CANCELLED_ORDER = 2,
	FORCED_LIQUIDATION = 3,
	DELIVERY_ORDER = 4,
}

export enum OrderStatus {
	READY_TO_SUBMIT = 1,
	SUBMITTED = 3,
	PARTIALLY_MATCHED = 4,
	CANCELLED_WITH_PARTIALLY_MATCHED = 5,
	FULLY_MATCHED = 6,
	CANCELLED = 7,
	FAILED = 10,
	CANCELLING = 11,
}

export enum OrderSource {
	SYSTEM = "system",
	WEB = "web",
	API = "api",
	M = "m",
	RISK = "risk",
	SETTLEMENT = "settlement",
	IOS = "ios",
	ANDROID = "android",
	WINDOWS = "windows",
	MAC = "mac",
	TRIGGER = "trigger",
	TPSL = "tpsl",
}

export enum OrderLiquidationType {
	NONE = 0,
	LONG_AND_SHORT_NETTING = 1,
	PARTIAL = 2,
	FULL = 3,
}

export type NumberBool = 0 | 1;
export enum MarginMode {
	ISOLATED = "isolated",
	CROSS = "cross",
}

export type PositionMode = "single_side" | "dual_side";
export type Role = "taker" | "maker";

export type OpenOrder = {
	update_time: number;
	symbol: AssetSymbol;
	contract_code: ContractCode;
	volume: number;
	price: number;
	order_price_type: OrderPriceType;
	order_type: OrderType;
	direction: Direction;
	offset: OrderOffset;
	lever_rate: number;
	order_id: number;
	client_order_id: null | number;
	created_at: number;
	trade_volume: number;
	trade_turnover: number;
	fee: number;
	trade_avg_price: null | number;
	margin_frozen: number;
	profit: number;
	status: OrderStatus;
	order_source: OrderSource;
	order_id_str: string;
	fee_asset: AssetSymbol;
	liquidation_type: OrderLiquidationType | null;
	canceled_at: null | number;
	margin_asset: AssetSymbol;
	margin_account: MarginAccount;
	margin_mode: MarginMode;
	is_tpsl: NumberBool;
	real_profit: NumberBool;
	trade_partition: AssetSymbol;
	reduce_only: NumberBool;
};

export interface Account {
	positions: Position[];
	symbol: AssetSymbol;
	margin_balance: number;
	margin_position: number;
	margin_frozen: number;
	margin_available: number;
	profit_real: number;
	profit_unreal: number;
	risk_rate: number;
	withdraw_available: number;
	liquidation_price: null | null;
	lever_rate: number;
	adjust_factor: number;
	margin_static: number;
	contract_code: ContractCode;
	margin_asset: AssetSymbol;
	margin_mode: MarginMode;
	margin_account: MarginAccount;
	trade_partition: AssetSymbol;
	position_mode: PositionMode;
}

interface Position {
	symbol: AssetSymbol;
	contract_code: ContractCode;
	volume: number;
	available: number;
	frozen: number;
	cost_open: number;
	cost_hold: number;
	profit_unreal: number;
	profit_rate: number;
	lever_rate: number;
	position_margin: number;
	direction: Direction;
	profit: number;
	last_price: number;
	margin_asset: AssetSymbol;
	margin_mode: MarginMode;
	margin_account: MarginAccount;
	trade_partition: AssetSymbol;
	position_mode: PositionMode;
}
