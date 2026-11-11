const Joi = require("../../config/joi");

// Constants
const { STATUSES } = require("../../common/constants");

exports.getMaintenanceById = Joi.objectId().required();

exports.baseSchema = Joi.object({
  workspace: Joi.objectId(),
  vehicle: Joi.objectId(),
  type: Joi.objectId(),
  priority: Joi.objectId(),
  vendor: Joi.objectId(),
  status: Joi.string().valid(...Object.values(STATUSES.MAINTENANCE)),
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref("startDate")),
  odometer: Joi.number().min(0),
  cost: Joi.number().min(0),
  checklist: Joi.array().items(
    Joi.object({
      item: Joi.objectId().required(),
      condition: Joi.objectId(),
    }),
  ),
  notes: Joi.string().trim().lowercase(),
  createdBy: Joi.objectId(),
});

exports.createMaintenance = exports.baseSchema
  .fork(["workspace", "vehicle", "type", "createdBy"], (schema) => schema.required())
  .fork("status", (schema) => schema.default(STATUSES.MAINTENANCE.INITIATED));

exports.updateMaintenance = exports.baseSchema
  .append({
    id: Joi.objectId().required(),
    removedBeforeImages: Joi.array().items(Joi.objectId()).unique(),
    removedAfterImages: Joi.array().items(Joi.objectId()).unique(),
  })
  .fork(["workspace", "createdBy"], (schema) => schema.strip());
