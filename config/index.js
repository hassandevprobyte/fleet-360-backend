const env = require("./env");
const connectDB = require("./db");
const { corsOptions } = require("./cors");
const { objectId, validate } = require("./joi");

module.exports = { env, connectDB, corsOptions, objectId, validate };
