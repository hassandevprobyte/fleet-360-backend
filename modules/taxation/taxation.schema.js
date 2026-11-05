const Joi = require("../../config/joi");

exports.getTaxationById = Joi.objectId().required();

exports.baseSchema = Joi.object({
  fleet: Joi.objectId(),
  challanNumber: Joi.string().trim(),
  jurisdiction: Joi.objectId(),
  startDate: Joi.number().min(1000).max(9999),
  endDate: Joi.number().min(1000).max(9999),
  filingDate: Joi.date(),
  amount: Joi.number().min(0).default(0),
  notes: Joi.string().trim().empty(""),
  createdBy: Joi.objectId(),
});

exports.createTaxation = exports.baseSchema.fork(["fleet", "challanNumber", "startDate", "endDate", "amount"], (schema) => schema.required());

exports.updateTaxation = exports.baseSchema
  .append({
    id: Joi.objectId().required(),
  })
  .fork("createdBy", (schema) => schema.strip());
