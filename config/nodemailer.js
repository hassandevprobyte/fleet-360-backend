const nodemailer = require("nodemailer");

// Environment Variables
const env = require("./env");

const transporter = (smtp) => {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465, // true for 465, false for other ports
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    ...(env.NODE_ENV === "development" && {
      tls: {
        rejectUnauthorized: false,
      },
    }),
  });
};

module.exports = transporter;
