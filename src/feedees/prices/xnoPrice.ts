import BasePrice from "./base";

import { PriceFeedee } from "../types";
import { MarketSymbol } from "../../types/order";

class XnoPriceFeedee extends BasePrice implements PriceFeedee {
	_symbol = MarketSymbol.XNOUSDT;
	channel = `market.${this._symbol}.ticker`;
}

export default new XnoPriceFeedee();
