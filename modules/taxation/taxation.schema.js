const Joi = require("../../config/joi");

exports.getTaxationById = Joi.objectId().required();

exports.baseSchema = Joi.object({
  workspace: Joi.objectId(),
  vehicle: Joi.objectId(),
  challanNumber: Joi.string().trim(),
  jurisdiction: Joi.objectId(),
  startDate: Joi.number().min(1000).max(9999),
  endDate: Joi.number().min(1000).max(9999),
  filingDate: Joi.date(),
  amount: Joi.number().min(0),
  notes: Joi.string().trim().empty(""),
  createdBy: Joi.objectId(),
});

exports.createTaxation = exports.baseSchema.fork(["workspace", "vehicle", "challanNumber", "startDate", "endDate", "amount", "createdBy"], (schema) => schema.required());

exports.updateTaxation = exports.baseSchema
  .append({
    id: Joi.objectId().required(),
    removedDocuments: Joi.array().items(Joi.objectId()).unique(),
  })
  .fork(["workspace", "createdBy"], (schema) => schema.strip());
