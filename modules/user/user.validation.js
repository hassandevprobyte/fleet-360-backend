const Boom = require("@hapi/boom");

// Repositories
const userRepository = require("./user.repository");

// Constants
const { MESSAGE: message } = require("../../common/constants");

exports.throwErrorIfUserDoesNotExist = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw Boom.notFound(message.error.user.notFound);
  }

  return user;
};

exports.throwErrorIfAnyUserDoesNotExist = async (userIds) => {
  const users = await userRepository.getUsersByIds(userIds);

  if (users.length !== userIds.length) {
    throw Boom.notFound(message.error.user.notFound);
  }

  return users;
};

exports.throwErrorIfUserEmailExists = async (email) => {
  const emailExists = await userRepository.getUserByEmail(email);

  if (emailExists) {
    throw Boom.conflict(message.error.user.emailExists);
  }
};
