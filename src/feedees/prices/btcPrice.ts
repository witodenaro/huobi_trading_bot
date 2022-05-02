import BasePrice from "./base";

import { SYMBOLS } from "../symbols";
import { Feedee } from "../types";

class BtcPriceFeedee extends BasePrice implements Feedee {
  _symbol = SYMBOLS.BTC;
  channel = `market.${this._symbol}.ticker`;
}

export default new BtcPriceFeedee();