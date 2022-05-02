import { enc, HmacSHA256 } from "crypto-js";
import { config } from "../config";

interface ICreateSignature {
	method: string;
	baseUrl: string;
	path: string;
	params: object;
}

export const createSignature = ({
	method,
	baseUrl,
	path,
	params,
}: ICreateSignature) => {
	if (!config.SECRET_KEY) {
		throw new Error("SECRET_KEY is missing in .env config");
	}

	const sortByAscii = (left: string, right: string) =>
		Buffer.from(left, "ascii") > Buffer.from(right, "ascii") ? 1 : -1;

	const requestParamsKeyValuePairs = (
		Object.keys(params) as (keyof typeof params)[]
	).reduce((keyValuePairs, key) => {
		const value = params[key];

		if (!value) {
			return keyValuePairs;
		}

		const encodedValue = encodeURIComponent(value);
		const keyValuePair = `${key}=${encodedValue}`;

		return [...keyValuePairs, keyValuePair];
	}, [] as string[]);

	const sortedRequestParamsKeyValuePairs =
		requestParamsKeyValuePairs.sort(sortByAscii);
	const requestParamsKeyValuePairsString =
		sortedRequestParamsKeyValuePairs.join("&");

	const signatureElements = [
		method,
		baseUrl,
		path,
		requestParamsKeyValuePairsString,
	];
	const unsignedText = signatureElements.join("\n");

	const signature = HmacSHA256(unsignedText, config.SECRET_KEY);
	const signatureEncoded = signature.toString(enc.Base64);

	return signatureEncoded;
};
