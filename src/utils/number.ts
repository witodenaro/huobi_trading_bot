export const toFixed = (num: number, precision: number) => {
  return Number(num.toFixed(precision));
};

export const getPrecision = (number: number) => {
  return number.toString().split(".")[1]?.length || 0;
};
