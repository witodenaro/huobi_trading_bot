import BasePrice from "./base";

import { PriceFeedee } from "../types";
import { MarketSymbol } from "../../types/order";

class EgsPriceFeedee extends BasePrice implements PriceFeedee {
  _symbol = MarketSymbol.EGSUSDT;
  channel = `market.${this._symbol}.ticker`;
}

export default new EgsPriceFeedee();
