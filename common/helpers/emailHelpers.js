const Boom = require("@hapi/boom");

// Configs
const transporter = require("../../config/nodemailer");

exports.verifySMTP = async (smtp) => {
  try {
    await transporter(smtp).verify();
  } catch (error) {
    switch (error.code) {
      case "EAUTH":
        throw Boom.badRequest("Invalid email credentials");

      case "ESOCKET":
        throw Boom.badRequest("Failed to connect to email server");

      case "ETIMEDOUT":
        throw Boom.badRequest("Connection timeout");

      default:
        throw Boom.badRequest("Failed to connect to email server");
    }
  }
};

exports.sendMail = async (emailMessage, smtp) => {
  try {
    const email = await transporter(smtp).sendMail(emailMessage);

    return {
      message: `Email successfully sent to: ${email.accepted.join(", ")}`,
    };
  } catch (error) {
    console.log("Error sending email:", error);
    if (error.code === "EENVELOPE") {
      if (error.responseCode === 550) {
        if (error.response?.includes("Sender verify failed")) {
          throw Boom.badRequest("Invalid email address");
        }

        if (error.rejected?.length) {
          throw Boom.badRequest(`Recipient rejected: ${error.rejected.join(", ")}`);
        }

        throw Boom.badRequest("Email rejected");
      }
    }

    if (error.code === "EAUTH") {
      throw Boom.badRequest("Invalid email credentials");
    }

    if (error.code === "ECONNECTION") {
      throw Boom.serverUnavailable("Failed to connect to email server");
    }

    throw Boom.badImplementation(error.message || "Failed to send email");
  }
};
