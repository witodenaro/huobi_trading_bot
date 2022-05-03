import { connection, Message as WSMessage } from "websocket";
import { createSignature } from "../../auth/signature";
import { getTimestamp } from "../../auth/utils";
import { config } from "../../config";
import { log } from "../../utils/logger";
import { parseWebsocketMessage } from "../utils";
import { AuthMessage, Message } from "./types";

const WEBSOCKET_AUTH_TIMEOUT = 10000;

export const authenticate = (connection: connection) => {
	const timestamp = getTimestamp();

	const params = {
		AccessKeyId: config.ACCESS_KEY,
		SignatureMethod: config.SIGNATURE_METHOD,
		SignatureVersion: config.USDTM_SOCKET_SIGNATURE_VERSION,
		Timestamp: timestamp,
	};

	const signature = createSignature({
		method: "GET",
		baseUrl: config.FUTURES_BASE_URL,
		path: "/linear-swap-notification",
		params,
	});

	const authPayload = {
		op: "auth",
		type: "api",
		...params,
		Signature: signature,
	};

	return new Promise((resolve, reject) => {
		const rejectAndRemoveListener = (...msg: any[]) => {
			connection.removeListener("message", messageListener);
			reject(...msg);
		};

		const resolveAndRemoveListener = (msg: any) => {
			connection.removeListener("message", messageListener);
			resolve(msg);
		};

		const messageListener = (data: WSMessage) => {
			const parsedMessage = parseWebsocketMessage(data) as Message;

			if (parsedMessage.op === "auth") {
				const msg = parsedMessage as AuthMessage;

				if (msg["err-code"] === 0) {
					resolveAndRemoveListener(null);
				} else {
					log("Websocket USDTM authentication failure");
					rejectAndRemoveListener();
				}
			}
		};

		connection.on("message", messageListener);

		connection.send(JSON.stringify(authPayload));

		setTimeout(() => {
			rejectAndRemoveListener("Websocket USDTM authentication timed out");
		}, WEBSOCKET_AUTH_TIMEOUT);
	});
};
