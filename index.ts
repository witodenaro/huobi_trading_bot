import { initSocketConnection } from "./src/connection/sockets";
import EthOrderFeedee from "./src/feedees/orders/ethOrder";
import EthPriceFeedee from "./src/feedees/prices/ethPrice";
import { Trader } from "./src/puppeteers/trader";
import { ContractCode } from "./src/types/order";

const init = async () => {
	await initSocketConnection();

  const ethTrader = new Trader(ContractCode.ETH_USDT, EthPriceFeedee, EthOrderFeedee);
  await ethTrader.init();
}

init();
