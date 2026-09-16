const Joi = require("joi");
const { objectId } = require("../../config");

exports.getUserById = objectId.required();

exports.baseSchema = Joi.object({
  name: Joi.string().lowercase().trim().min(2).max(255),
  email: Joi.string().email().lowercase().trim().min(2).max(255),
  password: Joi.string().empty(""),
  companies: Joi.array().items(objectId).unique().min(1),
  brands: Joi.array().items(objectId).unique().min(1),
  roles: Joi.array().items(objectId).unique().min(1),
  isActive: Joi.boolean(),
});

exports.createUser = exports.baseSchema
  .fork(["name", "email", "companies", "brands", "roles"], (schema) => schema.required())
  .fork("password", (schema) => schema.default("Abcd1234"))
  .fork("isActive", (schema) => schema.default(true));

exports.updateUser = exports.baseSchema.append({ id: objectId.required() });
