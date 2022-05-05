import { getAssetsAndPositions } from "../api/linear-swap-api/v1/swap_account_position_info";
import {
  Contract,
  getContractInfo,
} from "../api/linear-swap-api/v1/swap_contract_info";
import { getOpenOrders } from "../api/linear-swap-api/v1/swap_openorders";
import { PositionState } from "../puppets/Position";
import {
  Account,
  AccountPosition,
  ContractCode,
  Direction,
  MarginMode,
  OpenOrder,
  OrderOffset,
} from "../types/order";
import { toFixed } from "./number";

export type AccountPos = {
  entryPrice: number;
  amount: number;
};

export type AccountOrder = {
  entryPrice: number;
  amount: number;
  orderId: string;
};

export type AccountInfo = {
  short?: AccountPos;
  long?: AccountPos;
  margin_available: number; // balance
};

type OpenOrdersInfo = {
  short: AccountOrder | null;
  long: AccountOrder | null;
};

export type AccountOrderPos = {
  entryPrice: number;
  amount: number;
  state: PositionState;
  orderId?: string;
};

const getPosInfo = ({
  cost_open: entryPrice,
  position_margin: margin,
  last_price: lastPrice,
}: AccountPosition): AccountPos => ({
  entryPrice,
  amount: margin / lastPrice,
});

export const searchForAccount = (accounts: Account[]) => {
  return accounts.find((account) => {
    const isIsolated = account.margin_mode === MarginMode.ISOLATED;
    const hasNoLeverage = (account.lever_rate = 1);

    return isIsolated && hasNoLeverage;
  });
};

export const searchForContract = (contracts: Contract[]) => {
  return contracts.find((contract) => {
    return contract.contract_type === "swap";
  });
};

type ContractSize = number;

export const parseContract = (contract: Contract): ContractSize => {
  return contract.contract_size;
};

export const parseAccount = (account: Account): AccountInfo => {
  const { positions } = account;

  const shortPos = positions?.find((pos) => pos.direction === Direction.SELL);
  const longPos = positions?.find((pos) => pos.direction === Direction.BUY);

  const { margin_available } = account;

  const info: AccountInfo = {
    margin_available,
  };

  if (shortPos) {
    info.short = getPosInfo(shortPos);
  }

  if (longPos) {
    info.long = getPosInfo(longPos);
  }

  return info;
};

export const parseOpenOrders = (openOrders: OpenOrder[]) => {
  return openOrders.reduce(
    (parsedData, order) => {
      const isOpen = order.offset === OrderOffset.OPEN;
      if (!isOpen) return parsedData;

      const isLong = order.direction === Direction.BUY;
      const isShort = order.direction === Direction.SELL;

      const orderInfo: AccountOrder = {
        entryPrice: order.price,
        amount: order.margin_frozen / order.price,
        orderId: order.order_id_str,
      };

      if (isLong) parsedData.long = orderInfo;
      if (isShort) parsedData.short = orderInfo;

      return parsedData;
    },
    { short: null, long: null } as OpenOrdersInfo
  );
};

export type AccountPositionsOrders = {
  margin_available: number;
  hasOpenPositionsOrAndOrders: boolean;
  contract_size: number;
  short?: AccountOrderPos;
  long?: AccountOrderPos;
};

export const getAccountPositionsOrders = async (
  contractCode: ContractCode
): Promise<AccountPositionsOrders> => {
  const assets = await getAssetsAndPositions({ contract_code: contractCode });
  const orders = await getOpenOrders({ contract_code: contractCode });
  const contracts = await getContractInfo({ contract_code: contractCode });

  if (!assets.data?.data) {
    throw new Error(`${contractCode} couldn't fetch assets and positions`);
  }

  if (!orders.data?.data) {
    throw new Error(`${contractCode} couldn't fetch orders`);
  }

  if (!contracts.data?.data) {
    throw new Error(`${contractCode} couldn't fetch contract info`);
  }

  const account = searchForAccount(assets.data.data);

  if (!account) {
    throw new Error(
      `${contractCode} couldn't find account. Probably it's empty`
    );
  }

  const contract = searchForContract(contracts.data.data);

  if (!contract) {
    throw new Error(
      `${contractCode} couldn't find contract.`
    );
  }

  const contractSize = parseContract(contract);
  const accountInfo = parseAccount(account);
  const orderInfo = parseOpenOrders(orders.data.data.orders);

  const { short: shortOrder, long: longOrder } = orderInfo;
  const { short: shortPosition, long: longPosition } = accountInfo;

  let short: AccountOrderPos | null = null;
  let long: AccountOrderPos | null = null;

  if (shortOrder || shortPosition) {
    const shortState = shortOrder ? PositionState.PENDING : PositionState.OPEN;
    short = {
      entryPrice:
        shortOrder?.entryPrice || (shortPosition as AccountPos).entryPrice,
      amount: toFixed(
        (shortOrder?.amount || 0) + (shortPosition?.amount || 0),
        2
      ),
      orderId: shortOrder?.orderId,
      state: shortState,
    };
  }

  if (longPosition || longOrder) {
    const longState = longOrder ? PositionState.PENDING : PositionState.OPEN;
    long = {
      entryPrice:
        longOrder?.entryPrice || (longPosition as AccountPos).entryPrice,
      amount: toFixed(
        (longOrder?.amount || 0) + (longPosition?.amount || 0),
        2
      ),
      orderId: longOrder?.orderId,
      state: longState,
    };
  }

  return {
    margin_available: accountInfo.margin_available,
    contract_size: contractSize,
    hasOpenPositionsOrAndOrders: !!(
      longPosition ||
      shortPosition ||
      longOrder ||
      shortOrder
    ),
    ...(short && { short }),
    ...(long && { long }),
  };
};

export const getHasEnoughBalance = (
  marginAvailable: number,
  price: number,
  contractSize: number
) => {
  // enough to open 2 lowest positions in different directions
  return marginAvailable / price > contractSize * 2;
};
