const Joi = require("joi");
const { objectId } = require("../../config");

exports.login = Joi.object({
  email: Joi.string().email().lowercase().trim().min(2).max(255).required(),
  password: Joi.string().trim().required(),
});

exports.changePassword = Joi.object({
  id: objectId.required(),
  oldPassword: Joi.string().trim().required(),
  newPassword: Joi.string().trim().required(),
});
