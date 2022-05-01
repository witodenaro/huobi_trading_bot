import { client as WebSocketClient, connection } from 'websocket';
import pako from 'pako';
import { ErrorData, FeedeeHash, PingData, PriceData, SocketMessage, SocketMessageData } from './types';
import { Feedee } from '../feedees/types';
import { log } from '../utils/logger';

const client = new WebSocketClient();

const pong = (connection: connection, message: PingData) => {
	connection.send(
		JSON.stringify({
			pong: message.ping,
		})
	);

	log('♥');
};

export const initSocketConnection = (feedees: Feedee[]) => {
	const feedeeByChannel: FeedeeHash = feedees.reduce((hash, feedee) => {
		hash[feedee._channel] = feedee;
		return hash;
	}, {} as FeedeeHash);

	client.on('connect', (connection) => {
		log('Websocket connected');

		feedees.forEach(feedee => feedee.init(connection));

		connection.on('message', (data) => {
			const message = data as SocketMessage;

			const uncompressedMessage = pako.ungzip(message.binaryData).buffer;
			const bufferedMessage = Buffer.from(uncompressedMessage);
			const parsedMessage = JSON.parse(bufferedMessage.toString()) as SocketMessageData;

			// Ping-pong with server
			if (parsedMessage.hasOwnProperty('ping')) {
				pong(connection, parsedMessage as PingData);
			}

			if (parsedMessage.hasOwnProperty('err-code')) {
				const errorMessage = parsedMessage as ErrorData;
				log('Error!', errorMessage);
			}

			if (parsedMessage.hasOwnProperty('ch')) {
				const priceMessage = parsedMessage as PriceData;

				const handler = feedeeByChannel[priceMessage.ch];

				if (!handler) {
					return log('No handler provided for channel', priceMessage.ch);
				}

				handler.handle(priceMessage);
			}
		});

		connection.on('close', (code, desc) => {
			log('Websocket connection closed', code, desc);
		});
	});

	client.on('connectFailed', (err) => {
		log('Websocket connection failed', err);
	});
};

client.connect('wss://api.huobi.pro/ws');
