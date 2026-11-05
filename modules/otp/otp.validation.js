const Boom = require("@hapi/boom");

// Config
const redis = require("../../config/redis");

// Messages
const { MESSAGE: message } = require("../../common/constants");

// Environment Variables
const { env } = require("../../config");

exports.throwErrorIfOTPExists = async (key) => {
  const data = await redis.getKey(key);

  if (data) {
    throw Boom.conflict(message.error.otp.alreadyExists);
  }
};

exports.throwErrorIfOTPDoesNotExist = async (key) => {
  const data = await redis.getKey(key);

  if (!data) {
    throw Boom.notFound(message.error.otp.notFound);
  }

  return data;
};

exports.throwErrorIfOTPMaxAttamptsReached = async (key) => {
  const data = await redis.getKey(key);

  if (data.attempts >= env.OTP.MAX_ATTEMPTS) {
    throw Boom.conflict(message.error.otp.maxAttemptsReached);
  }
};

exports.throwErrorIfOTPIsExpired = async (key) => {
  const ttl = await redis.getTtl(key);

  if (ttl <= 0) {
    throw Boom.conflict(message.error.otp.expired);
  }

  return ttl;
};

exports.throwErrorIfOTPisInvalid = (isValid) => {
  if (!isValid) {
    throw Boom.conflict(message.error.otp.invalid);
  }
};

exports.throwErrorIfOTPisNotCoolDown = async (key) => {
  const ttl = await redis.getTtl(key);
  const cooldownDuration = env.OTP.EXPIRY_MINUTES * 60 - env.OTP.COOLDOWN_MINUTES * 60;

  if (ttl > cooldownDuration) {
    throw Boom.tooManyRequests(message.error.otp.notCoolDown(env.OTP.COOLDOWN_MINUTES * 60));
  }
};

exports.throwErrorIfOTPMaxResendCountReached = (otp) => {
  if (otp?.resendCount >= env.OTP.MAX_RESEND_ATTEMPTS) {
    throw Boom.conflict(message.error.otp.maxResendReached);
  }
};
