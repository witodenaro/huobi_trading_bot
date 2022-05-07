import AncOrderFeedee from "./orders/ancOrder";
import AncPriceFeedee from "./prices/ancPrice";
import BtcPriceFeedee from "./prices/btcPrice";
import BtcOrderFeedee from "./orders/btcOrder";

export const priceFeedees = [AncPriceFeedee, BtcPriceFeedee];
export const orderFeedees = [AncOrderFeedee, BtcOrderFeedee];
