import { Account, Direction, MarginMode } from '../types/order';

export type InitPos = {
	entryPrice: number;
	amount: number;
};

export type InitInfo = {
	short?: InitPos;
	long?: InitPos;

	// min. amount for an order to be placed
	adjust_factor: number;

	// balance
	margin_available: number;

	hasOpenPositions: boolean;
};

export const searchForInitInfo = (accounts: Account[]) => {
	const account = accounts.find((account) => {
		const isIsolated = account.margin_mode === MarginMode.ISOLATED;
		const hasNoLeverage = (account.lever_rate = 1);

		return isIsolated && hasNoLeverage;
	});

	if (!account) {
		return null;
	}

	console.log(account)

	const { positions } = account;

	const shortPos = positions.find((pos) => pos.direction === Direction.SELL);
	const longPos = positions.find((pos) => pos.direction === Direction.BUY);

	const { margin_available, adjust_factor } = account;

	const info: InitInfo = {
		margin_available,
		adjust_factor,
		hasOpenPositions: !!(longPos || shortPos),
	};

	if (shortPos) {
		const { cost_open: shortEntryPrice, position_margin: shortPosMargin, last_price: shortLastPrice } = shortPos;

		info.short = {
			entryPrice: shortEntryPrice,
			amount: shortPosMargin / shortLastPrice,
		};
	}

	if (longPos) {
		const { cost_open: longEntryPrice, position_margin: longPosMargin, last_price: longLastPrice } = longPos;

		info.long = {
			entryPrice: longEntryPrice,
			amount: longPosMargin / longLastPrice,
		};
	}

	return info;
};

export const getHasEnoughBalance = (marginAvailable: number, price: number, minAmount: number) => {
	// enough to open 2 lowest positions in different directions
	return marginAvailable / price > minAmount * 2;
};