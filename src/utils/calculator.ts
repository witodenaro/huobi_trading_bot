import { toFixed } from "./number";

export const calculateStopLoss = (price: number, stopLossPercentageDeviation: number) => {
	return toFixed(price + (price * stopLossPercentageDeviation) / 100, 2);
};

export const calculatePlainDifference = (entryPrice: number, latestPrice: number) => {
	return latestPrice - entryPrice;
};

export const calculatePercentageDifference = (entryPrice: number, latestPrice: number) => {
	const plainDifference = latestPrice - entryPrice;

	return (plainDifference / entryPrice) * 100;
};

export const calculateEqualAmount = (latestPrice: number, marginAvailable: number) => {
	return (marginAvailable / latestPrice) / 2;
};