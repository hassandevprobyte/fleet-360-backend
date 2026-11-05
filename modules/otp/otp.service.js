// Validations
const joi = require("../../config/joi");
const joiSchema = require("./otp.schema");
const otpValidation = require("./otp.validation");

// Configs
const redis = require("../../config/redis");

// Environment Variables
const { env } = require("../../config");

// Helpers
const otpHelpers = require("./otp.helper");

exports.createOtp = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createOtp);

  await otpValidation.throwErrorIfOTPExists(validatedPayload.key);

  const otp = otpHelpers.generateOtp(env.OTP.LENGTH);
  const hash = otpHelpers.hashOtp(otp);

  await redis.setKey(validatedPayload.key, { hash, attempts: 0, resendCount: 0 }, env.OTP.EXPIRY_MINUTES * 60);

  return otp;
};

exports.resendOtp = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.resendOtp);

  const existingOtp = await redis.getKey(validatedPayload.key);

  otpValidation.throwErrorIfOTPMaxResendCountReached(existingOtp);

  if (existingOtp) {
    await otpValidation.throwErrorIfOTPisNotCoolDown(validatedPayload.key);
  }

  const otp = otpHelpers.generateOtp(env.OTP.LENGTH);
  const hash = otpHelpers.hashOtp(otp);

  await redis.setKey(
    validatedPayload.key,
    {
      hash,
      attempts: 0,
      resendCount: (existingOtp?.resendCount || 0) + 1,
    },
    env.OTP.EXPIRY_MINUTES * 60,
  );

  return otp;
};

exports.updateOtp = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateOtp);

  const existingOtp = await otpValidation.throwErrorIfOTPDoesNotExist(validatedPayload.key);

  const updatePayload = {
    ...existingOtp,
    ...validatedPayload,
  };

  delete updatePayload.key;

  return redis.setKey(validatedPayload.key, updatePayload, env.OTP.EXPIRY_MINUTES * 60);
};

exports.verifyOtp = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.verifyOtp);

  const existingOtp = await otpValidation.throwErrorIfOTPDoesNotExist(validatedPayload.key);

  await otpValidation.throwErrorIfOTPMaxAttamptsReached(validatedPayload.key);

  const isValid = otpHelpers.verifyOtp(validatedPayload.otp, existingOtp.hash);

  if (isValid) {
    await redis.deleteKey(validatedPayload.key);
    return { success: true, message: "Otp verified successfully" };
  }

  existingOtp.attempts += 1;

  const ttl = await otpValidation.throwErrorIfOTPIsExpired(validatedPayload.key);

  await redis.setKey(validatedPayload.key, existingOtp, ttl);
  otpValidation.throwErrorIfOTPisInvalid(isValid);
};

exports.deleteOtp = async ({ subject, purpose }) => {
  const key = getOtpKey(subject, purpose);

  return redis.deleteKey(key);
};
