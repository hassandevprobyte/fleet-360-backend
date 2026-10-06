const Joi = require("joi");

const { objectId } = require("../../config");

exports.getTaxationById = objectId.required();

exports.baseSchema = Joi.object({
  fleet: objectId,
  challanNumber: Joi.string().trim(),
  jurisdiction: objectId,
  startDate: Joi.number().positive().min(1000).max(9999),
  endDate: Joi.number().positive().min(1000).max(9999),
  filingDate: Joi.date(),
  amount: Joi.number().min(0).default(0),
  notes: Joi.string().trim().empty(""),
  createdBy: objectId,
});

exports.createTaxation = exports.baseSchema.fork(["fleet", "challanNumber", "startDate", "endDate", "amount"], (schema) => schema.required());

exports.updateTaxation = exports.baseSchema
  .append({
    id: objectId.required(),
  })
  .fork("createdBy", (schema) => schema.strip());
