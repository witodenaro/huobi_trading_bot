import BtcOrderFeedee from "./orders/btcOrder";
import EthOrderFeedee from "./orders/ethOrder";

import BtcPriceFeedee from "./prices/btcPrice";
import EthPriceFeedee from "./prices/ethPrice";

export const priceFeedees = [BtcPriceFeedee, EthPriceFeedee];
export const orderFeedees = [BtcOrderFeedee, EthOrderFeedee];
