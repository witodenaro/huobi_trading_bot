import { v4 as uuid } from "uuid";
import BaseOrder from "./base";
import { OrderFeedee } from "../types";
import { ContractCode } from "../../types/order";

export class EthOrderFeedee extends BaseOrder implements OrderFeedee {
	contractCode = ContractCode.ETH_USDT;
	channel = `orders.${this.contractCode}`;
	id = uuid();
}

export default new EthOrderFeedee();
