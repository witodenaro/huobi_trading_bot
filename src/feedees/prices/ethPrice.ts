import BasePrice from "./base";

import { PriceFeedee } from "../types";
import { MarketSymbol } from "../../types/order";

class EthPriceFeedee extends BasePrice implements PriceFeedee {
  _symbol = MarketSymbol.ETHUSDT;
  channel = `market.${this._symbol}.ticker`;
}

export default new EthPriceFeedee();
