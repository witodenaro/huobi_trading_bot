import { client as WebSocketClient } from 'websocket';
import pako from 'pako';
import { getTimestamp } from '../auth/utils';
import { createSignature } from '../auth/signature';
import { config } from '../config';


export const client = new WebSocketClient();

export const initSocketConnection = () => {
	const timestamp = getTimestamp();

	const signature = createSignature({
		method: 'GET',
		baseUrl: 'api.huobi.pro',
		path: '/ws',
		params: {
			Timestamp: timestamp,
			accessKey: config.ACCESS_KEY,
			signatureMethod: config.SIGNATURE_METHOD,
			signatureVersion: config.SOCKET_SIGNATURE_VERSION,
		},
	});

	const websocketAuthPayload = {
		action: 'req',
		ch: 'auth',
		params: {
			authType: 'api',
			accessKey: config.ACCESS_KEY,
			signatureMethod: config.SIGNATURE_METHOD,
			signatureVersion: config.SOCKET_SIGNATURE_VERSION,
			timestamp: timestamp,
			signature,
		},
	};

	client.on('connect', (connection) => {
    console.log('Websocket connected');

    connection.on('ping', (cancel, payload) => {
      console.log('Ping received');
      console.log(cancel);
      console.log(payload);
    });

    connection.on('message', (data) => {
      type Message = {
				type: 'binary';
				binaryData: Buffer;
			};

      type Ping = {
				ping: number;
			};

      const message = data as Message;


      const uncompressedMessage = pako.ungzip(message.binaryData).buffer;
      const bufferedMessage = Buffer.from(uncompressedMessage);
      const parsedMessage = JSON.parse(bufferedMessage.toString()) as Ping;

      console.log('Message received', parsedMessage);

      connection.send(
				JSON.stringify({
					pong: parsedMessage.ping,
				})
			);

      console.log('Pong sent');
		});

    connection.on('close', (code, desc) => {
      console.log('Websocket connection closed', code, desc);
    })
	});

	client.on('connectFailed', (err) => {
		console.log('Websocket connection failed', err);
	});
};

client.connect('wss://api.huobi.pro/ws');
