import { AxiosResponse } from "axios";
import { request } from "../../../connection/request";

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

export const getAccountValuation = () =>
	request({
		method: "GET",
		path: "/v2/account/valuation",
	}) as Promise<AxiosResponse<Response>>;
