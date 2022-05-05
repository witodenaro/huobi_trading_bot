import BasePrice from "./base";

import { PriceFeedee } from "../types";
import { MarketSymbol } from "../../types/order";

class AncPriceFeedee extends BasePrice implements PriceFeedee {
  _symbol = MarketSymbol.ANCUSDT;
  channel = `market.${this._symbol}.ticker`;
}

export default new AncPriceFeedee();
