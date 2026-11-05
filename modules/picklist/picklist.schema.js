const Joi = require("../../config/joi");

// Constants
const { COLORS, MODELS, PICKLIST } = require("../../common/constants");

exports.getPicklistById = Joi.objectId().required();

exports.baseSchema = Joi.object({
  preserveTitleFormatting: Joi.boolean(),
  title: Joi.string().trim().min(1).max(255).when("preserveTitleFormatting", { is: true, then: Joi.string(), otherwise: Joi.string().lowercase() }),
  acronym: Joi.string().uppercase().trim().empty(""),
  scope: Joi.string().valid(...Object.values(PICKLIST.SCOPE)),
  resource: Joi.string()
    .trim()
    .empty("")
    .valid(...Object.values(MODELS))
    .when("scope", { is: PICKLIST.SCOPE.RESOURCE, then: Joi.required(), otherwise: Joi.optional() }),
  field: Joi.string().trim().min(1).max(255),
  parentPicklist: Joi.objectId(),
  color: Joi.string()
    .lowercase()
    .trim()
    .empty("")
    .valid(...Object.values(COLORS)),
  order: Joi.number().min(0),
  isDefault: Joi.boolean(),
  isActive: Joi.boolean(),
  meta: Joi.object(),
});

exports.createPicklist = exports.baseSchema
  .fork(["title", "field"], (schema) => schema.required())
  .fork(["preserveTitleFormatting", "isDefault"], (schema) => schema.default(false))
  .fork("scope", (schema) => schema.default(PICKLIST.SCOPE.RESOURCE))
  .fork("color", (schema) => schema.default(COLORS.GRAY))
  .fork("order", (schema) => schema.default(0))
  .fork("isActive", (schema) => schema.default(true))
  .fork("meta", (schema) => schema.default({}));

exports.updatePicklist = exports.baseSchema.append({ id: Joi.objectId().required() });

exports.reorderPicklist = Joi.object({
  draggedPicklistId: Joi.objectId().required(),
  targetPicklistId: Joi.objectId().required(),
  targetParentPicklistId: Joi.objectId().allow(null).optional(),
});
