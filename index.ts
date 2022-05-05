import { initSocketConnection } from "./src/connection/sockets";
import AncOrderFeedee from "./src/feedees/orders/ancOrder";
import AncPriceFeedee from "./src/feedees/prices/ancPrice";
import { Trader } from "./src/puppeteers/trader";
import { ContractCode } from "./src/types/order";

const init = async () => {
  await initSocketConnection();

  const ancTrader = new Trader(
    ContractCode.ANC_USDT,
    AncPriceFeedee,
    AncOrderFeedee
  );
  await ancTrader.init();
};

init();
