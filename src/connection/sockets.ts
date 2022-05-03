import { orderFeedees, priceFeedees } from "../feedees";
import { log } from "../utils/logger";
import { initSpotConnection } from "./spot/webSocketClient";
import { initUSDTMConnection } from "./usdt-m/webSocketClient";

export const initSocketConnection = async () => {
	log("Initializing web socket connection..");

	try {
		await initSpotConnection(priceFeedees);
		await initUSDTMConnection(orderFeedees);
	} catch (err) {
		log("Websocket connection failure", err);
	}
};
