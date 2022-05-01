import { connection } from "websocket";

import { SYMBOLS } from "../symbols";
import { Feedee } from "../types";

import { PriceData } from "../../connection/types";
import { log } from "../../utils/logger";

class BtcPriceFeedee implements Feedee {
  _symbol = SYMBOLS.BTC;
  _channel = `market.${this._symbol}.ticker`;
  _latestPrice: null | number = null;

  init(connection: connection) {
    const requestPayload = {
			sub: this._channel,
		};

    connection.send(JSON.stringify(requestPayload));
  }

  handle(message: PriceData) {
    if (this._latestPrice !== message.tick.close) {
			log('BTC price changed: ', message.tick.close);
      this._latestPrice = message.tick.close;
		}
  }
}

export default new BtcPriceFeedee();