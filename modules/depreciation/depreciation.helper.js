const Boom = require("@hapi/boom");

// Constants
const ENUMS = require("../../constants/ENUMS");

const getDepreciationMethod = (method) => {
  return Object.values(ENUMS.DEPRECIATION.METHODS).find((item) => item.VALUE === method);
};

exports.validateDepreciationMethod = (payload) => {
  const method = getDepreciationMethod(payload.method);

  if (!method) {
    throw Boom.badRequest("Invalid depreciation method");
  }

  switch (method.VALUE) {
    case ENUMS.DEPRECIATION.METHODS.STRAIGHT_LINE.VALUE:
      if (!payload.acquisitionCost) {
        throw Boom.badRequest("Acquisition cost is required");
      }

      if (!payload.usefulLifeMonths) {
        throw Boom.badRequest("Useful life is required");
      }
      break;

    case ENUMS.DEPRECIATION.METHODS.DECLINING_BALANCE.VALUE:
      if (!payload.acquisitionCost) {
        throw Boom.badRequest("Acquisition cost is required");
      }

      if (payload.depreciationRate === undefined || payload.depreciationRate === null) {
        throw Boom.badRequest("Depreciation rate is required");
      }
      break;

    case ENUMS.DEPRECIATION.METHODS.DOUBLE_DECLINING_BALANCE.VALUE:
      if (!payload.acquisitionCost) {
        throw Boom.badRequest("Acquisition cost is required");
      }

      if (!payload.usefulLifeMonths) {
        throw Boom.badRequest("Useful life is required");
      }
      break;

    case ENUMS.DEPRECIATION.METHODS.UNITS_OF_PRODUCTION.VALUE:
      if (!payload.acquisitionCost) {
        throw Boom.badRequest("Acquisition cost is required");
      }

      if (!payload.totalExpectedUnits) {
        throw Boom.badRequest("Total expected units are required");
      }

      if (payload.totalAcquiredUnits === undefined || payload.totalAcquiredUnits === null) {
        throw Boom.badRequest("Total acquired units are required");
      }
      break;
  }
};
