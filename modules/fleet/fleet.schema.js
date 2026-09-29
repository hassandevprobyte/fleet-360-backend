const Joi = require("joi");
const { objectId } = require("../../config");

exports.getFleetById = objectId.required();

exports.baseSchema = Joi.object({
  make: objectId,
  model: objectId,
  year: Joi.number().min(1900).max(2100),
  type: objectId,
  fuelType: objectId,
  transmission: objectId,
  color: Joi.string().lowercase().trim().min(3).max(255),
  licensePlate: Joi.string().trim().min(1).max(255),
  purchaseAmount: Joi.number().positive(),
  purchaseDate: Joi.date(),
  rent: Joi.number().positive(),
  initialOdometer: Joi.number().positive(),
  currentOdometer: Joi.number().positive(),
  status: objectId,
  condition: objectId,
  company: objectId,
  assignedTo: objectId,
  assignedBy: objectId,
  assignedOn: Joi.date(),
  inspector: objectId,
  createdBy: objectId,
});

exports.createFleet = exports.baseSchema.fork(
  ["make", "model", "year", "type", "fuelType", "transmission", "color", "licensePlate", "purchaseAmount", "purchaseDate", "rent", "initialOdometer", "status", "condition"],
  (schema) => schema.required(),
);

exports.updateFleet = exports.baseSchema.append({ id: objectId.required() }).fork("createdBy", (schema) => schema.strip());

exports.getFleetsSummaryByGroup = Joi.object({
  filters: Joi.object().default({}).optional(),
  primaryGroup: Joi.string().trim().valid("make", "model", "type", "fuelType", "transmission", "status", "condition").default("make").optional(),
  secondaryGroup: Joi.string().trim().valid("make", "model", "type", "fuelType", "transmission", "status", "condition").default("model").optional(),
});
