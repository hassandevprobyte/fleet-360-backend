const Joi = require("joi");
const { objectId } = require("../../config");

exports.getInsuranceById = objectId.required();

exports.baseSchema = Joi.object({
  company: objectId,
  fleet: objectId,
  policyNumber: Joi.string().trim().required(),
  provider: objectId,
  status: objectId,
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref("startDate")),
  cancellationDate: Joi.date(),
  cancellationReason: Joi.string().trim().empty(""),
  premium: Joi.number().min(0),
  coverage: Joi.number().min(0),
  notes: Joi.string().trim().empty(""),
  createdBy: objectId,
});

exports.createInsurance = exports.baseSchema.fork(["fleet", "policyNumber", "provider", "status", "startDate", "endDate", "premium", "coverage"], (schema) => schema.required());

exports.updateInsurance = exports.baseSchema
  .append({
    id: objectId.required(),
  })
  .fork("createdBy", (schema) => schema.strip());
