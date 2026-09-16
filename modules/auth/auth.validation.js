const bcrypt = require("bcrypt");
const Boom = require("@hapi/boom");

// Repositories
const userRepository = require("../user/user.repository");

// Constants
const message = require("../../constants/MESSAGE");


exports.throwErrorIfUserEmailDoesNotExist = async (userEmail) => {
  const user = await userRepository.getUserByEmail(userEmail);

  if (!user) {
    throw Boom.notFound(message.error.auth.emailNotExists);
  }

  return user;
};

exports.throwErrorIfUserIsInactive = (user) => {
  if (!user.isActive) {
    throw Boom.forbidden(message.error.auth.accessDenied);
  }
};

exports.throwErrorIfPasswordIncorrect = async (plainPassword, hashedPassword) => {
  const match = await bcrypt.compare(plainPassword, hashedPassword);

  if (!match) {
    throw Boom.badRequest(message.error.auth.invalidCredentials);
  }
};
