const formatAmount = (amount = 0, locale = "en-US", options = {}) => {
  const defaultOptions = {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: options.notation === "compact" ? 2 : Number.isInteger(amount) ? 0 : 2,
  };

  const formatter = new Intl.NumberFormat(locale, { ...defaultOptions, ...options });

  return formatter.format(amount);
};

module.exports = formatAmount;
