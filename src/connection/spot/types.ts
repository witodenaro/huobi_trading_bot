import { Feedee, PriceFeedee } from '../../feedees/types';

export type PingMessage = {
	ping: number;
};

export type ErrorMessage = {
	status: 'error';
	ts: number;
	'err-code': string;
	'err-msg': string;
};

export type PriceMessage = {
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

export type SubMessage = {
	id: null;
	status: 'ok';
	subbed: string;
	ts: number;
};

export type SocketMessageData = PingMessage | ErrorMessage | PriceMessage | SubMessage;

export type FeedeeHash = Record<string, PriceFeedee>;

export type SocketMessage = {
	type: 'binary';
	binaryData: Buffer;
};
