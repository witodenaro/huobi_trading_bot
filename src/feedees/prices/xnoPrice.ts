import BasePrice from "./base";

import { SYMBOLS } from "../symbols";
import { Feedee } from "../types";

class XnoPriceFeedee extends BasePrice implements Feedee {
  _symbol = SYMBOLS.XNO;
  channel = `market.${this._symbol}.ticker`;
}

export default new XnoPriceFeedee();