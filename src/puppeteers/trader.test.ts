import { OrderFeedee, PriceFeedee } from "../feedees/types";
import {
  AssetSymbol,
  ContractCode,
  Direction,
  MarginAccount,
  MarginMode,
  OrderOffset,
  OrderPriceType,
} from "../types/order";
import { Trader } from "./trader";

const getMockPriceFeedee = (
  overwrites?: Partial<PriceFeedee>
): PriceFeedee => ({
  init: jest.fn(),
  handleMessage: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  channel: "",
  getLatestPrice: jest.fn(),
  ...overwrites,
});

const getMockOrderFeedee = (
  overwrites?: Partial<OrderFeedee>
): OrderFeedee => ({
  init: jest.fn(),
  handleMessage: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  channel: "",
  contractCode: ContractCode.BTC_USDT,
  id: "",
  ...overwrites,
});

jest.mock("../config.ts", () => ({
  config: {
    SECRET_KEY: "mock",
  },
}));

const mockOrderResponse = {
  contract_code: ContractCode.BTC_USDT,
  price: 2,
  volume: 1,
  direction: Direction.BUY,
  offset: OrderOffset.OPEN,
  lever_rate: 1,
  order_price_type: OrderPriceType.LIMIT,
};

jest.mock("../api/linear-swap-api/v1/swap_order.ts", () => ({
  placeOrder: jest.fn(() => ({
    data: {
      data: mockOrderResponse,
    },
  })),
}));

const mockAccount = {
  positions: [],
  symbol: AssetSymbol.BTC,
  margin_balance: 1000,
  margin_position: 0,
  margin_frozen: 0,
  margin_available: 1000,
  profit_real: 0,
  profit_unreal: 0,
  risk_rate: 0,
  withdraw_available: 10,
  liquidation_price: null,
  lever_rate: 1,
  adjust_factor: 0.01,
  margin_static: 0,
  contract_code: ContractCode.BTC_USDT,
  margin_asset: AssetSymbol.BTC,
  margin_mode: MarginMode.ISOLATED,
  margin_account: MarginAccount.BTC_USDT,
  trade_partition: AssetSymbol.USDT,
  position_mode: "single_side",
};

jest.mock("../api/linear-swap-api/v1/swap_account_position_info.ts", () => ({
  getAssetsAndPositions: jest.fn(() => ({
    data: {
      data: [mockAccount],
    },
  })),
}));

jest.mock("../api/linear-swap-api/v1/swap_openorders.ts", () => ({
  getOpenOrders: jest.fn(() => ({
    data: {
      data: {
        orders: [],
        total_page: 1,
        current_page: 1,
        total_size: 1,
      },
    },
  })),
}));

const mockContractInfo = {
  symbol: AssetSymbol.BTC,
  contract_code: ContractCode.BTC_USDT,
  contract_size: 1,
  price_tick: 1,
  delivery_date: "",
  delivery_time: "",
  create_date: "",
  contract_status: 1,
  settlement_date: "",
  support_margin_mode: "all",
  business_type: "swap",
  pair: ContractCode.BTC_USDT,
  contract_type: "swap",
  trade_partition: AssetSymbol.USDT,
};

jest.mock("../api/linear-swap-api/v1/swap_contract_info.ts", () => ({
  getContractInfo: jest.fn(() => ({
    data: {
      data: [mockContractInfo],
    },
  })),
}));

jest.mock("../api/linear-swap-api/v1/swap_tpsl_cancelall.ts", () => ({
  cancelAllStopLossTakeProfit: jest.fn(),
}));

describe("Trader", () => {
  describe("Initialization", () => {
    it("Should subscribe to price and order feedees", async () => {
      const addPriceListener = jest.fn();
      const addOrderListener = jest.fn();
      const mockPriceFeedee = getMockPriceFeedee({
        addListener: addPriceListener,
        getLatestPrice: () => 10,
      });
      const mockOrderFeedee = getMockOrderFeedee({
        contractCode: ContractCode.BTC_USDT,
        addListener: addOrderListener,
      });

      const trader = new Trader(
        ContractCode.BTC_USDT,
        mockPriceFeedee,
        mockOrderFeedee
      );

      await trader.init();

      expect(addPriceListener).toBeCalled();
      expect(addOrderListener).toBeCalled();
    });

    it("Should throw error if has unsufficient balance", async () => {
      mockAccount.margin_available = 0;

      const mockPriceFeedee = getMockPriceFeedee({
        getLatestPrice: () => 10,
      });
      const mockOrderFeedee = getMockOrderFeedee({
        contractCode: ContractCode.BTC_USDT,
      });

      const trader = new Trader(
        ContractCode.BTC_USDT,
        mockPriceFeedee,
        mockOrderFeedee
      );

      await expect(trader.init()).rejects.toEqual(
        Error(
          "BTC-USDT trader can't open new positions due to unsufficient balance. Min is 20"
        )
      );
    });
  });
});
