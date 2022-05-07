import AncOrderFeedee from "./orders/ancOrder";
import BtcOrderFeedee from "./orders/btcOrder";

import AncPriceFeedee from "./prices/ancPrice";
import BtcPriceFeedee from "./prices/btcPrice";

export const priceFeedees = [AncPriceFeedee, BtcPriceFeedee];
export const orderFeedees = [AncOrderFeedee, BtcOrderFeedee];
