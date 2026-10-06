const Joi = require("joi");
const { objectId } = require("../../config");

// Constants
const ENUMS = require("../../constants/ENUMS");

exports.getMaintenanceById = objectId.required();

exports.baseSchema = Joi.object({
  company: objectId,
  fleet: objectId,
  type: objectId,
  priority: objectId,
  vendor: objectId,
  status: Joi.string()
    .valid(...Object.values(ENUMS.MAINTENANCE.STATUSES))
    .default(ENUMS.MAINTENANCE.STATUSES.INITIATED),
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref("startDate")),
  odometer: Joi.number().min(0),
  cost: Joi.number().min(0),
  checklist: Joi.array().items(
    Joi.object({
      item: objectId.required(),
      condition: objectId,
    }),
  ),
  notes: Joi.string().trim().lowercase(),
  createdBy: objectId,
});

exports.createMaintenance = exports.baseSchema.fork(["fleet", "type"], (schema) => schema.required());

exports.updateMaintenance = exports.baseSchema
  .append({
    id: objectId.required(),
  })
  .fork("createdBy", (schema) => schema.strip());
