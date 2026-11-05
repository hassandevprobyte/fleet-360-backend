const Boom = require("@hapi/boom");
const crypto = require("crypto");

// Config
const { env } = require("../../config");

exports.generateOtp = (length) => {
  if (!Number.isInteger(length) || length !== env.OTP.LENGTH) {
    throw Boom.conflict(`OTP length must be ${env.OTP.LENGTH} digits`);
  }

  return crypto
    .randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0");
};

exports.hashOtp = (otp) => {
  return crypto.createHmac("sha256", env.OTP.SECRET).update(otp).digest("hex");
};

exports.verifyOtp = (otp, hashedOtp) => {
  if (!otp || !hashedOtp) {
    throw Boom.conflict(`OTP and hashed OTP are required`);
  }

  const generatedHash = Buffer.from(exports.hashOtp(otp), "hex");
  const storedHash = Buffer.from(hashedOtp, "hex");

  if (generatedHash.length !== storedHash.length) {
    throw Boom.conflict("Invalid OTP hash");
  }

  return crypto.timingSafeEqual(generatedHash, storedHash);
};

exports.getOtpExpiry = (minutes = env.OTP.EXPIRY_MINUTES) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

exports.isOtpExpired = (expiresAt) => {
  return !expiresAt || new Date(expiresAt).getTime() <= Date.now();
};
