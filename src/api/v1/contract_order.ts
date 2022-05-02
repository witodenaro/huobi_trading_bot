import { AxiosResponse } from "axios";
import { config } from "../../config";
import { request } from "../../connection/request";

interface Response {
	code: number;
	data: {
		updated: null;
		todayProfitRate: null;
		totalBalance: string;
		todayProfit: null;
		profitAccountBalanceList: Object[];
	};
}

export const postContractOrder = () => request({
	method: 'POST',
	path: 'api/v1/contract_order',
	baseUrl: config.FUTURES_BASE_URL,
	body: {},
}) as Promise<AxiosResponse<Response>>;