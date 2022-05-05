import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import { AssetSymbol, ContractCode, MarginMode } from "../../../types/order";
import { ResponseStatus } from "../../../types/requests";

export type Contract = {
  symbol: AssetSymbol;
  contract_code: ContractCode;
  contract_size: number;
  price_tick: number;
  delivery_date: string;
  delivery_time: string;
  create_date: string;
  contract_status: number;
  settlement_date: string;
  support_margin_mode: "all";
  business_type: "swap";
  pair: ContractCode;
  contract_type: "swap";
  trade_partition: AssetSymbol;
};

interface Response {
  status: ResponseStatus;
  data: Contract[];
  ts: number;
}

type Params = {
  contract_code: ContractCode;
};

export const getContractInfo = ({ contract_code }: Params) =>
  request({
    method: "GET",
    path: "/linear-swap-api/v1/swap_contract_info",
    baseUrl: config.FUTURES_BASE_URL,
    params: {
      contract_code,
      support_margin_mode: MarginMode.ALL,
    },
  }) as Promise<AxiosResponse<Response>>;
