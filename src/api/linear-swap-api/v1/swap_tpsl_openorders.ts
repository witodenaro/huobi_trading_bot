import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import {
  AssetSymbol,
  ContractCode,
  Direction,
  MarginAccount,
  MarginMode,
  OrderPriceType,
  OrderSource,
} from "../../../types/order";

export interface SLTLOrder {
  symbol: AssetSymbol;
  contract_code: ContractCode;
  margin_mode: MarginMode;
  margin_account: MarginAccount;
  volume: number;
  order_type: number;
  direction: Direction;
  order_id: number;
  order_id_str: string;
  order_source: OrderSource;
  trigger_type: "le" | "ge";
  trigger_price: number;
  order_price: number;
  created_at: number;
  order_price_type: OrderPriceType;
  status: number;
  tpsl_order_type: "tp" | "sl";
  source_order_id: string;
  relation_tpsl_order_id: string;
}

interface SuccessResponse {
  status: "ok";
  data: {
    orders: SLTLOrder[];
    total_page: number;
    current_page: number;
    total_size: number;
  };
  ts: number;
}

type Params = {
  contract_code: ContractCode;
};

export const getAllStopLossTakeProfit = ({ ...params }: Params) =>
  request({
    method: "POST",
    path: "/linear-swap-api/v1/swap_tpsl_openorders",
    baseUrl: config.FUTURES_BASE_URL,
    body: params,
  }) as Promise<AxiosResponse<SuccessResponse>>;
