import { connection } from "websocket";
import { FeedeesHash, Message, PingMessage, SocketMessage } from "./types";
import { log } from "../../utils/logger";
import { OrderFeedee } from "../../feedees/types";
import Pako from "pako";
import { parseWebsocketMessage } from "../utils";

const pong = (connection: connection, message: PingMessage) => {
	connection.send(
		JSON.stringify({
			op: "pong",
			ts: message.ts,
		})
	);

	log("♡");
};

export const setupMessageHandler = (
	connection: connection,
	feedees: OrderFeedee[]
) => {
	feedees.forEach((feedee) => feedee.init(connection));

	const feedeesByContractCode = feedees.reduce((feedeesHash, feedee) => {
		feedeesHash[feedee.contractCode] = feedee;
		return feedeesHash;
	}, {} as FeedeesHash);

	connection.on("message", (message) => {
		const parsedMessage = parseWebsocketMessage(message) as Message;

		// Ping-pong with server
		if (parsedMessage.op === "ping") {
			pong(connection, parsedMessage as PingMessage);
		}

		if (parsedMessage.op === "notify") {
			const feedee = feedeesByContractCode[parsedMessage.contract_code];

			if (!feedee) {
				return log(`Feedee for ${parsedMessage.contract_code} does not exist`);
			}

			feedee.handleMessage(parsedMessage);
		}

		if (parsedMessage.op === "sub") {
			log(`USDTM Websocket subscribed to "${parsedMessage.topic}" channel`);
		}

		if ((parsedMessage as any)["err-code"]) {
			log("USDTM websocket error:", parsedMessage);
		}
	});
};
