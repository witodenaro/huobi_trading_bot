import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import { ContractCode } from "../../../types/order";

type CancelError = {
  order_id: string;
  err_code: number;
  err_msg: string;
};

interface Response {
  code: number;
  data: {
    errors: CancelError[];
    successes: string;
  };
}

type Params = {
  order_id: string;
  contract_code: ContractCode;
};

export const cancelOrder = ({ order_id, contract_code }: Params) =>
  request({
    method: "POST",
    path: "/linear-swap-api/v1/swap_cancel",
    baseUrl: config.FUTURES_BASE_URL,
    body: {
      order_id,
      contract_code,
    },
  }) as Promise<AxiosResponse<Response>>;
