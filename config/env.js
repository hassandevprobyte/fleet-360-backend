const dotenv = require("dotenv");
dotenv.config();
const Joi = require("joi");

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required(),
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
  JWT: {
    ACCESS_TOKEN_SECRET: envVars.JWT_ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: envVars.JWT_REFRESH_TOKEN_SECRET,
  },
  ENCRYPTION_KEY: envVars.ENCRYPTION_KEY,
};

module.exports = env;
