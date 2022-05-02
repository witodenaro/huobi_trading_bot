export const calculateStopLoss = (price: number, stopLossPercentageDeviation: number) => {
	return price + (price * stopLossPercentageDeviation) / 100;
};

export const calculatePlainDifference = (entryPrice: number, latestPrice: number) => {
	return latestPrice - entryPrice;
};

export const calculatePercentageDifference = (entryPrice: number, latestPrice: number) => {
	const plainDifference = latestPrice - entryPrice;

	return (plainDifference / entryPrice) * 100;
};
