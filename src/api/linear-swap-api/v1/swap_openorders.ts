import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import { OpenOrder } from "../../../types/order";
import { ResponseStatus } from "../../../types/requests";

interface Response {
  status: ResponseStatus;
  data: {
    orders: OpenOrder[];
    total_page: number;
    current_page: number;
    total_size: number;
  };
  ts: number;
}

type Params = {
  contract_code: string;
};

export const getOpenOrders = ({ contract_code }: Params) =>
  request({
    method: "POST",
    path: "/linear-swap-api/v1/swap_openorders",
    baseUrl: config.FUTURES_BASE_URL,
    body: {
      contract_code,
    },
  }) as Promise<AxiosResponse<Response>>;
