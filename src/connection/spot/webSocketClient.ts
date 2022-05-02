import { client as WebSocketClient } from 'websocket';
import { PriceFeedee } from '../../feedees/types';

import { log } from '../../utils/logger';
import { setupMessageHandler } from './messageHandler';
import { config } from '../../config';

const client = new WebSocketClient();

export const initSpotConnection = (feedees: PriceFeedee[]) => {
	const connect = () => client.connect(`wss://${config.BASE_URL}/ws`);

	return new Promise((resolve, reject) => {
		client.on('connect', (connection) => {
			log('Spot Websocket is connected');
			setupMessageHandler(connection, feedees);

			connection.on('close', (code, desc) => {
				log('Spot Websocket connection closed');
				log('CODE: ', code);
				log(desc);

				log('Spot Websocket is trying to reconnect..');
				connect();
			});

			resolve(null);
		});

		client.on('connectFailed', (err) => {
			reject(err);
		});

		connect();
	});
};
