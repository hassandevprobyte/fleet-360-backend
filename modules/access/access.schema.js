const Joi = require("joi");
const { objectId } = require("../../config");

exports.getAccessById = objectId.required();

exports.baseSchema = Joi.object({
  user: objectId,
  roles: objectId,
});

exports.getUsersForAccess = Joi.object({
  accessToken: Joi.string().required(),
});

exports.createAccess = exports.baseSchema.fork(["user", "roles"], (schema) => schema.required());

exports.updateAccess = exports.baseSchema.append({ id: objectId.required() });
