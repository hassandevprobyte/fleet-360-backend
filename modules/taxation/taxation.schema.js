const Joi = require("joi");

const { objectId } = require("../../config");

exports.getTaxationById = objectId.required();

exports.baseSchema = Joi.object({
  company: objectId,
  fleet: objectId,
  challanNumber: Joi.string().trim(),
  jurisdiction: objectId,
  status: objectId,
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref("startDate")),
  filingDate: Joi.date(),
  taxAmount: Joi.number().min(0).default(0),
  notes: Joi.string().trim().empty(""),
  createdBy: objectId,
});

exports.createTaxation = exports.baseSchema.fork(["fleet", "challanNumber", "status", "startDate", "endDate", "taxAmount"], (schema) => schema.required());

exports.updateTaxation = exports.baseSchema
  .append({
    id: objectId.required(),
  })
  .fork("createdBy", (schema) => schema.strip());
