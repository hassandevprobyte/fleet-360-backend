const Joi = require("joi");
const { objectId } = require("../../config");

exports.getInsuranceById = objectId.required();

exports.baseSchema = Joi.object({
  company: objectId,
  fleet: objectId,
  policyNumber: Joi.string().trim().required(),
  provider: objectId,
  broker: objectId,
  type: objectId,
  status: objectId,
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref("startDate")),
  cancellationDate: Joi.date(),
  cancellationReason: Joi.string().trim().empty(""),
  totalPremium: Joi.number().min(0),
  taxAmount: Joi.number().min(0).default(0),
  discountAmount: Joi.number().min(0).default(0),
  totalAmount: Joi.number().min(0),
  deductible: Joi.number().min(0),
  coverages: Joi.array().items(
    Joi.object({
      type: objectId.required(),
      limit: Joi.number().min(0),
      deductible: Joi.number().min(0),
      premium: Joi.number().min(0),
    }),
  ),
  notes: Joi.string().trim().empty(""),
  createdBy: objectId,
});

exports.createInsurance = exports.baseSchema.fork(["fleet", "policyNumber", "provider", "type", "status", "startDate", "endDate"], (schema) => schema.required());

exports.updateInsurance = exports.baseSchema
  .append({
    id: objectId.required(),
  })
  .fork("createdBy", (schema) => schema.strip());
