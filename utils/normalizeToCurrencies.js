const CURRENCY = require("../constants/CURRENCY");
const DOLLAR_RATE = 270;

const ratesToUSD = {
  [CURRENCY.PKR]: 1 / DOLLAR_RATE,
  [CURRENCY.USD]: 1,
};

/**
 * Converts an amount in a given currency to all defined currencies.
 * If currency is not provided or unknown, returns zeros for all currencies.
 *
 * @param {number} amount - The input amount
 * @param {string} [currency] - The currency of the input amount
 * @returns {Object} - Object with converted amounts for all currencies
 *
 * @example
 * normalizeToCurrencies(2700, CURRENCY.PKR)
 * // => { PKR: 2700, USD: 10 }
 *
 * normalizeToCurrencies(0)
 * // => { PKR: 0, USD: 0 }
 */
const normalizeToCurrencies = (amount = 0, currency) => {
  if (!currency || !ratesToUSD[currency]) {
    return Object.fromEntries(Object.values(CURRENCY).map((cur) => [cur, 0]));
  }

  return Object.fromEntries(
    Object.values(CURRENCY).map((targetCurrency) => {
      const targetRate = ratesToUSD[targetCurrency];
      const sourceRate = ratesToUSD[currency];

      if (!targetRate || !sourceRate) return [targetCurrency, 0];

      if (targetCurrency === currency) return [targetCurrency, amount];

      const converted = amount * (sourceRate / targetRate);

      return [targetCurrency, converted];
    }),
  );
};

module.exports = normalizeToCurrencies;
