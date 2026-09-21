const Joi = require("joi");

const { objectId } = require("../../config");

exports.getMaintenanceById = objectId.required();

const componentSchema = Joi.object({
  component: objectId.required(),
  quantity: Joi.number().min(1).default(1).required(),
  unitCost: Joi.number().min(0).required(),
  totalCost: Joi.number().min(0).required(),
});

const checklistItemSchema = Joi.object({
  item: objectId.required(),
  status: objectId.required(),
  condition: objectId,
});

exports.baseSchema = Joi.object({
  company: objectId,
  fleet: objectId,
  type: objectId,
  status: objectId,
  priority: objectId,
  reportedBy: objectId,
  assignedTo: objectId,
  assignedOn: Joi.date(),
  provider: objectId,
  startedDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref("startedDate")),
  odometer: Joi.number().min(0),
  cost: Joi.number().min(0),
  components: Joi.array().items(componentSchema),
  checklist: Joi.array().items(checklistItemSchema),
  notes: Joi.string().trim().lowercase(),
  createdBy: objectId,
});

exports.createMaintenance = exports.baseSchema.fork(["fleet", "type"], (schema) => schema.required());

exports.updateMaintenance = exports.baseSchema
  .append({
    id: objectId.required(),
  })
  .fork("createdBy", (schema) => schema.strip());
