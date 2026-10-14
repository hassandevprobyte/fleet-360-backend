const Joi = require("joi");
const { objectId } = require("../../config");

// Constants
const ENUMS = require("../../constants/ENUMS");

exports.getInsuranceById = objectId.required();

exports.baseSchema = Joi.object({
  fleet: objectId,
  policyNumber: Joi.string().trim(),
  provider: objectId,
  status: Joi.string()
    .valid(...Object.values(ENUMS.INSURANCE.STATUSES))
    .default(ENUMS.INSURANCE.STATUSES.ACTIVE),
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
