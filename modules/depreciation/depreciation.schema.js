const Joi = require("../../config/joi");

// Constants
const { DEPRECIATION } = require("../../common/constants");

exports.getDepreciationById = Joi.objectId().required();

exports.baseSchema = Joi.object({
  fleet: Joi.objectId(),
  method: Joi.string().valid(...Object.values(DEPRECIATION.METHODS).map((method) => method.VALUE)),
  salvageValue: Joi.number().min(0),
  usefulLifeMonths: Joi.number().min(1),
  depreciationRate: Joi.number().min(0).max(100),
  acquisitionCost: Joi.number().min(0),
  totalAcquiredUnits: Joi.number().min(1),
  totalExpectedUnits: Joi.number().min(1),
  startDate: Joi.date(),
});

exports.createDepreciation = exports.baseSchema.fork(["fleet", "method", "acquisitionCost", "startDate"], (schema) => schema.required());

exports.updateDepreciation = exports.baseSchema.append({ id: Joi.objectId().required() });
