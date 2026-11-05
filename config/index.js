const env = require("./env");
const connectDB = require("./db");
const transporter = require("./nodemailer");
const { corsOptions } = require("./cors");

module.exports = { env, connectDB, transporter, corsOptions };
