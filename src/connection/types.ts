import { Feedee } from "../feedees/types";

export type SocketMessage = {
	type: 'binary';
	binaryData: Buffer;
};

export type PingData = {
	ping: number;
};

export type ErrorData = {
	status: 'error';
	ts: number;
	'err-code': string;
	'err-msg': string;
};

export type PriceData = {
	ch: string;
	ts: number;
	tick: {
		id: number;
		open: number;
		close: number;
		low: number;
		high: number;
		amount: number;
		vol: number;
		count: number;
	};
};

export type SocketMessageData = PingData | ErrorData | PriceData;

export type FeedeeHash = Record<string, Feedee>;
