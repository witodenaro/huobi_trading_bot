export const calculateStopLoss = (
  price: number,
  stopLossPercentageDeviation: number
) => {
  return price + (price * stopLossPercentageDeviation) / 100;
};

export const calculatePlainDifference = (
  entryPrice: number,
  latestPrice: number
) => {
  return latestPrice - entryPrice;
};

export const calculatePercentageDifference = (
  entryPrice: number,
  latestPrice: number
) => {
  const plainDifference = latestPrice - entryPrice;

  return (plainDifference / entryPrice) * 100;
};

export const calculateEqualVolume = (
  latestPrice: number,
  marginAvailable: number,
  contractSize: number
) => {
  return Math.floor(marginAvailable / latestPrice / 2 / contractSize);
};
