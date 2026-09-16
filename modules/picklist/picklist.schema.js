const Joi = require("joi");
const { objectId } = require("../../config");

// Constants
const COLORS = require("../../constants/COLORS");
const MODELS = require("../../constants/MODELS");
const { SCOPE } = require("../../constants/PICKLIST");

exports.getPicklistById = objectId.required();

exports.baseSchema = Joi.object({
  preserveTitleFormatting: Joi.boolean(),
  title: Joi.string().trim().min(1).max(255).when("preserveTitleFormatting", { is: true, then: Joi.string(), otherwise: Joi.string().lowercase() }),
  acronym: Joi.string().uppercase().trim().empty(""),
  scope: Joi.string().valid(...Object.values(SCOPE)),
  resource: Joi.string()
    .trim()
    .empty("")
    .valid(...Object.values(MODELS))
    .when("scope", { is: SCOPE.RESOURCE, then: Joi.required(), otherwise: Joi.optional() }),
  field: Joi.string().trim().min(1).max(255),
  parentPicklist: objectId,
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
  .fork("scope", (schema) => schema.default(SCOPE.RESOURCE))
  .fork("color", (schema) => schema.default(COLORS.GRAY))
  .fork("order", (schema) => schema.default(0))
  .fork("isActive", (schema) => schema.default(true))
  .fork("meta", (schema) => schema.default({}));

exports.updatePicklist = exports.baseSchema.append({ id: objectId.required() });

exports.reorderPicklist = Joi.object({
  draggedPicklistId: objectId.required(),
  targetPicklistId: objectId.required(),
  targetParentPicklistId: objectId.allow(null).optional(),
});
