const Joi = require("../../config/joi");

// Environment Variables
const { env } = require("../../config");

exports.baseSchema = Joi.object({
  key: Joi.string().trim(),
  otp: Joi.string().length(env.OTP.LENGTH).trim(),
  attempts: Joi.string().trim(),
});

exports.createOtp = exports.baseSchema.fork(["key"], (schema) => schema.required());

exports.resendOtp = exports.baseSchema.fork(["key"], (schema) => schema.required());

exports.updateOtp = exports.baseSchema.fork(["key"], (schema) => schema.required());

exports.verifyOtp = exports.baseSchema.fork(["key", "otp"], (schema) => schema.required());
