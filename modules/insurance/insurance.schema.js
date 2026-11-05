const Joi = require("../../config/joi");

// Constants
const { STATUSES } = require("../../common/constants");

exports.getInsuranceById = Joi.objectId().required();

exports.baseSchema = Joi.object({
  fleet: Joi.objectId(),
  policyNumber: Joi.string().trim(),
  provider: Joi.objectId(),
  status: Joi.string().valid(...Object.values(STATUSES.INSURANCE)),
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref("startDate")),
  cancellationDate: Joi.date(),
  cancellationReason: Joi.string().trim().empty(""),
  premium: Joi.number().min(0),
  coverage: Joi.number().min(0),
  notes: Joi.string().trim().empty(""),
  createdBy: Joi.objectId(),
});

exports.createInsurance = exports.baseSchema
  .fork(["fleet", "policyNumber", "provider", "status", "startDate", "endDate", "premium", "coverage"], (schema) => schema.required())
  .fork("status", (schema) => schema.default(STATUSES.INSURANCE.ACTIVE));

exports.updateInsurance = exports.baseSchema
  .append({
    id: Joi.objectId().required(),
  })
  .fork("createdBy", (schema) => schema.strip());
