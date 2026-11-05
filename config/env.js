const dotenv = require("dotenv");
dotenv.config();
const Joi = require("./joi");

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  AUTH_360_API_URL: Joi.string().uri().required(),
  CORE_360_API_URL: Joi.string().uri().required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required(),
  OTP_SECRET: Joi.string().required(),
  OTP_LENGTH: Joi.number().integer().min(4).max(10).default(6),
  OTP_MAX_ATTEMPTS: Joi.number().integer().max(3).default(3),
  OTP_MAX_RESEND_ATTEMPTS: Joi.number().integer().max(3).default(3),
  OTP_EXPIRY_MINUTES: Joi.number().integer().min(1).default(5),
  OTP_COOLDOWN_MINUTES: Joi.number().integer().min(1).default(1),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().email().required(),
  SMTP_PASSWORD: Joi.string().required(),
}).unknown(true);

const { value: envVars, error } = envSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const env = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGODB_URI: envVars.MONGODB_URI,
  FRONTEND_URL: envVars.FRONTEND_URL,
  REDIS_URL: envVars.REDIS_URL,
  AUTH_360_API_URL: envVars.AUTH_360_API_URL,
  CORE_360_API_URL: envVars.CORE_360_API_URL,
  JWT: {
    ACCESS_TOKEN_SECRET: envVars.JWT_ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: envVars.JWT_REFRESH_TOKEN_SECRET,
  },
  OTP: {
    SECRET: envVars.OTP_SECRET,
    LENGTH: envVars.OTP_LENGTH,
    MAX_ATTEMPTS: envVars.OTP_MAX_ATTEMPTS,
    MAX_RESEND_ATTEMPTS: envVars.OTP_MAX_RESEND_ATTEMPTS,
    EXPIRY_MINUTES: envVars.OTP_EXPIRY_MINUTES,
    COOLDOWN_MINUTES: envVars.OTP_COOLDOWN_MINUTES,
  },
  SMTP: {
    HOST: envVars.SMTP_HOST,
    PORT: envVars.SMTP_PORT,
    USER: envVars.SMTP_USER,
    PASSWORD: envVars.SMTP_PASSWORD,
  },
  ENCRYPTION_KEY: envVars.ENCRYPTION_KEY,
};

module.exports = env;
