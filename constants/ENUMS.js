const ENUMS = {
  DEPRECIATION: {
    METHODS: {
      STRAIGHT_LINE: {
        VALUE: "STRAIGHT_LINE",
        // ALERT: usefulLife is in months
        FORMULA: ({ cost, salvageValue = 0, usefulLife }) => (cost - salvageValue) / usefulLife,
      },
      DECLINING_BALANCE: {
        VALUE: "DECLINING_BALANCE",
        FORMULA: ({ bookValue, depreciationRate }) => bookValue * (depreciationRate / 100),
      },
      DOUBLE_DECLINING_BALANCE: {
        VALUE: "DOUBLE_DECLINING_BALANCE",
        // ALERT: usefulLife is in months
        FORMULA: ({ bookValue, usefulLife }) => bookValue * (2 / usefulLife),
      },
      UNITS_OF_PRODUCTION: {
        VALUE: "UNITS_OF_PRODUCTION",
        FORMULA: ({ cost, salvageValue = 0, totalExpectedUnits, unitsProduced }) => ((cost - salvageValue) / totalExpectedUnits) * unitsProduced,
      },
    },
  },
};

module.exports = ENUMS;
