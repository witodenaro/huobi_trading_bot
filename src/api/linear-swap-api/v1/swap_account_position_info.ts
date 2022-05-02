import { AxiosResponse } from 'axios';
import { config } from '../../../config';
import { request } from '../../../connection/request';
import { ContractCode, Account } from '../../../types/order';
import { ResponseStatus } from '../../../types/requests';

interface Response {
	status: ResponseStatus;
	data: Account[];
	ts: number;
}

type Params = {
	contract_code: ContractCode;
};

export const getAssetsAndPositions = ({ contract_code }: Params) =>
	request({
		method: 'POST',
		path: '/linear-swap-api/v1/swap_account_position_info',
		baseUrl: config.FUTURES_BASE_URL,
		body: {
			contract_code,
		},
	}) as Promise<AxiosResponse<Response>>;
