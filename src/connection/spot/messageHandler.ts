import Pako from "pako";
import { connection } from "websocket";
import {
  ErrorMessage,
  FeedeeHash,
  PingMessage,
  PriceMessage,
  SocketMessage,
  SocketMessageData,
  SubMessage,
} from "./types";
import { PriceFeedee } from "../../feedees/types";
import { log } from "../../utils/logger";

const pong = (connection: connection, message: PingMessage) => {
  connection.send(
    JSON.stringify({
      pong: message.ping,
    })
  );

  log("♥");
};

export const setupMessageHandler = (
  connection: connection,
  feedees: PriceFeedee[]
) => {
  const feedeeByChannel: FeedeeHash = feedees.reduce((hash, feedee) => {
    hash[feedee.channel] = feedee;
    return hash;
  }, {} as FeedeeHash);

  feedees.forEach((feedee) => feedee.init(connection));

  connection.on("message", (data) => {
    const message = data as SocketMessage;

    const uncompressedMessage = Pako.ungzip(message.binaryData).buffer;
    const bufferedMessage = Buffer.from(uncompressedMessage);
    const parsedMessage = JSON.parse(
      bufferedMessage.toString()
    ) as SocketMessageData;

    // Ping-pong with server
    if (parsedMessage.hasOwnProperty("ping")) {
      pong(connection, parsedMessage as PingMessage);
    }

    if (parsedMessage.hasOwnProperty("err-code")) {
      const errorMessage = parsedMessage as ErrorMessage;
      log("Spot websocket error", errorMessage);
    }

    if (parsedMessage.hasOwnProperty("subbed")) {
      const subMessage = parsedMessage as SubMessage;
      log(`Spot Websocket subscribed to "${subMessage.subbed}" channel`);
    }

    if (parsedMessage.hasOwnProperty("ch")) {
      const priceMessage = parsedMessage as PriceMessage;

      const handler = feedeeByChannel[priceMessage.ch];

      if (!handler) {
        return log(
          "Spot websocket error: no handler provided for channel",
          priceMessage.ch
        );
      }

      handler.handleMessage(priceMessage);
    }
  });
};
