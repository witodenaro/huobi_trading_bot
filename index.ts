import { initSocketConnection } from "./src/connection/webSocketClient";
import { feedees } from "./src/feedees";
import BtcPriceFeedee from "./src/feedees/prices/btcPrice";
import { Trader } from "./src/puppeteers/trader";

const init = async () => {
  initSocketConnection(feedees);
  const btcTrader = new Trader(BtcPriceFeedee);
}

init();
