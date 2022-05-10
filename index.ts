import { initSocketConnection } from "./src/connection/sockets";

import BtcOrderFeedee from "./src/feedees/orders/btcOrder";
import EthOrderFeedee from "./src/feedees/orders/ethOrder";

import BtcPriceFeedee from "./src/feedees/prices/btcPrice";
import EthPriceFeedee from "./src/feedees/prices/ethPrice";

import { Trader } from "./src/puppeteers/trader";
import { ContractCode } from "./src/types/order";

const init = async () => {
  await initSocketConnection();

  const btcTrader = new Trader(
    ContractCode.BTC_USDT,
    BtcPriceFeedee,
    BtcOrderFeedee
  );
  await btcTrader.init();

  const ethTrader = new Trader(
    ContractCode.ETH_USDT,
    EthPriceFeedee,
    EthOrderFeedee
  );
  await ethTrader.init();
};

init();
