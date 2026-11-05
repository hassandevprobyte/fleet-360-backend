const Joi = require("../../config/joi");

// Environment Variables
const { env } = require("../../config");

exports.signup = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  email: Joi.string().email().lowercase().trim().min(2).max(255).required(),
  password: Joi.string().min(6).max(255).required(),
}).unknown(false);

exports.verifyEmail = Joi.object({
  id: Joi.objectId().required(),
  otp: Joi.string().length(env.OTP.LENGTH).trim(),
}).unknown(false);

exports.resendOtp = Joi.object({
  id: Joi.objectId().required(),
}).unknown(false);

exports.login = Joi.object({
  email: Joi.string().email().lowercase().trim().min(2).max(255).required(),
  password: Joi.string().trim().required(),
}).unknown(false);

exports.changePassword = Joi.object({
  id: Joi.objectId().required(),
  oldPassword: Joi.string().trim().required(),
  newPassword: Joi.string().trim().required(),
}).unknown(false);
