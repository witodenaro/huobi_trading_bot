import { config } from '../config';
import { requester } from './requester';
import { createSignature } from '../auth/signature';
import { getTimestamp } from '../auth/utils';

interface IRequest {
  method: string;
  path: string;
  params?: object;
	body?: object;
	baseUrl?: string;
}

export const request = async ({
  method,
  path,
  params: extraParams,
	body,
	baseUrl = config.BASE_URL,
}: IRequest) => {
	const timestamp = getTimestamp();

	const params = {
		AccessKeyId: config.ACCESS_KEY,
		SignatureVersion: config.SIGNATURE_VERSION,
		SignatureMethod: config.SIGNATURE_METHOD,
		Timestamp: timestamp,
		...extraParams,
		...body,
	};

	const signatureEncoded = createSignature({
		method,
		baseUrl,
		path,
		params,
	});

	const response = await requester(path, {
		baseURL: baseUrl,
		method,
		params: {
			...params,
			Signature: signatureEncoded,
		},
		data: body,
	});
	
	return response;
};
