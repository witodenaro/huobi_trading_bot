import { client as WebSocketClient } from "websocket";

import { authenticate } from "./auth";
import { setupMessageHandler } from "./messageHandler";
import { log } from "../../utils/logger";
import { config } from "../../config";
import { OrderFeedee } from "../../feedees/types";

const client = new WebSocketClient();

export const initUSDTMConnection = (feedees: OrderFeedee[]) => {
	const connect = () =>
		client.connect(`wss://${config.FUTURES_BASE_URL}/linear-swap-notification`);

	return new Promise((resolve, reject) => {
		client.on("connect", async (connection) => {
			log("USDTM Websocket is connected");
			try {
				await authenticate(connection);
				log("USDTM Websocket is authenticated");

				setupMessageHandler(connection, feedees);

				connection.on("close", (code, desc) => {
					log("USDTM Websocket connection closed");
					log("CODE: ", code);
					log(desc);

					log("USDTM Websocket is trying to reconnect..");
					connect();
				});

				resolve(null);
			} catch (err) {
				reject(err);
			}
		});

		client.on("connectFailed", (err) => {
			reject(err);
		});

		connect();
	});
};
