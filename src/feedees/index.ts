import AncOrderFeedee from "./orders/ancOrder";
import BtcOrderFeedee from "./orders/btcOrder";
import EgsOrderFeedee from "./orders/egsOrder";

import AncPriceFeedee from "./prices/ancPrice";
import BtcPriceFeedee from "./prices/btcPrice";
import EgsPriceFeedee from "./prices/egsPrice";


export const priceFeedees = [AncPriceFeedee, BtcPriceFeedee, EgsPriceFeedee];
export const orderFeedees = [AncOrderFeedee, BtcOrderFeedee, EgsOrderFeedee];
