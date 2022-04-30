import { config } from '../config';
import { requester } from './requester';
import { createSignature } from '../auth/signature';
import { getTimestamp } from '../auth/utils';

interface IRequest {
  method: string;
  path: string;
  params?: object;
}

export const request = async <T>({
  method,
  path,
  params: extraParams,
}: IRequest) => {
	const timestamp = getTimestamp();

	const params = {
		AccessKeyId: config.ACCESS_KEY,
		SignatureVersion: config.SIGNATURE_VERSION,
		SignatureMethod: config.SIGNATURE_METHOD,
		'order-id': 1234567890,
		Timestamp: timestamp,
		...extraParams,
	};

	const signatureEncoded = createSignature({
		method,
		baseUrl: config.BASE_URL,
		path,
		params,
	});

	const response = await requester(path, {
		method,
		params: {
			...params,
			Signature: signatureEncoded,
		},
	});
	
	return response;
};
