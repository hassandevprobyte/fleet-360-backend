const Joi = require("joi");
const { objectId } = require("../../config");

// Constants
const ENUMS = require("../../constants/ENUMS");

exports.getDepreciationById = objectId.required();

exports.baseSchema = Joi.object({
  fleet: objectId,
  method: Joi.string().valid(...Object.values(ENUMS.DEPRECIATION.METHODS).map((method) => method.VALUE)),
  salvageValue: Joi.number().min(0),
  usefulLifeMonths: Joi.number().min(1),
  depreciationRate: Joi.number().min(0).max(100),
  acquisitionCost: Joi.number().min(0),
  totalAcquiredUnits: Joi.number().min(1),
  totalExpectedUnits: Joi.number().min(1),
  startDate: Joi.date(),
});

exports.createDepreciation = exports.baseSchema.fork(["fleet", "method", "acquisitionCost", "startDate"], (schema) => schema.required());

exports.updateDepreciation = exports.baseSchema.append({ id: objectId.required() });
