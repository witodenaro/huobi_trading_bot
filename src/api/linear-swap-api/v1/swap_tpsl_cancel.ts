import { AxiosResponse } from "axios";
import { config } from "../../../config";
import { request } from "../../../connection/request";
import { ContractCode } from "../../../types/order";
import { ResponseStatus } from "../../../types/requests";

type Error = {
  order_id: string;
  err_code: number;
  err_msg: string;
}

interface Response {
	status: ResponseStatus;
	data: {
		errors: Error[];
		successes: string;
	};
	ts: number;
}

type Params = {
	contract_code: ContractCode;
	order_id: string;
};

export const cancelStopLossTakeProfit = ({ ...params }: Params) =>
	request({
		method: 'POST',
		path: '/linear-swap-api/v1/swap_tpsl_cancel',
		baseUrl: config.FUTURES_BASE_URL,
		body: params,
	}) as Promise<AxiosResponse<Response>>;
