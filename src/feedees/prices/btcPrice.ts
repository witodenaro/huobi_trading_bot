import BasePrice from "./base";

import { PriceFeedee } from "../types";
import { MarketSymbol } from "../../types/order";

class BtcPriceFeedee extends BasePrice implements PriceFeedee {
  _symbol = MarketSymbol.BTCUSDT;
  channel = `market.${this._symbol}.ticker`;
}

export default new BtcPriceFeedee();
