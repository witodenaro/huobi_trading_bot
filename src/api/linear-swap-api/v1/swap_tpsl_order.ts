import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import { ContractCode, Direction, OrderPriceType } from "../../../types/order";

export interface SLTLOrderDigest {
  order_id: number;
  order_id_str: string;
}

interface ErrorResponse {
  status: "error";
  err_code: number;
  err_msg: string;
  ts: number;
}

interface SuccessResponse {
  status: "ok";
  data: {
    tp_order: SLTLOrderDigest | null;
    sl_order: SLTLOrderDigest | null;
  };
  ts: number;
}

type Params = {
  contract_code: ContractCode;
  volume: number;

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
    method: "POST",
    path: "/linear-swap-api/v1/swap_tpsl_order",
    baseUrl: config.FUTURES_BASE_URL,
    body: params,
  }) as Promise<AxiosResponse<SuccessResponse | ErrorResponse>>;
