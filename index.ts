import { initSocketConnection } from "./src/connection/sockets";

import AncOrderFeedee from "./src/feedees/orders/ancOrder";
import BtcOrderFeedee from "./src/feedees/orders/btcOrder";
import EgsOrderFeedee from "./src/feedees/orders/egsOrder";

import AncPriceFeedee from "./src/feedees/prices/ancPrice";
import BtcPriceFeedee from "./src/feedees/prices/btcPrice";
import EgsPriceFeedee from "./src/feedees/prices/egsPrice";

import { Trader } from "./src/puppeteers/trader";
import { ContractCode } from "./src/types/order";

const init = async () => {
  await initSocketConnection();

  const egsTrader = new Trader(
    ContractCode.EGS_USDT,
    EgsPriceFeedee,
    EgsOrderFeedee
  );
  await egsTrader.init();

  const btcTrader = new Trader(
    ContractCode.BTC_USDT,
    BtcPriceFeedee,
    BtcOrderFeedee
  );
  await btcTrader.init();

  const ancTrader = new Trader(
    ContractCode.ANC_USDT,
    AncPriceFeedee,
    AncOrderFeedee
  );
  await ancTrader.init();
};

init();
