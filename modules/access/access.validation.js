const Boom = require("@hapi/boom");

// Repositories
const accessRepository = require("./access.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfAccessDoesNotExist = async (accessId) => {
  const access = await accessRepository.getAccessById(accessId);

  if (!access) {
    throw Boom.notFound(message.error.access.notFound);
  }

  return access;
};

exports.throwErrorIfAccessUserExists = async (userId) => {
  const access = await accessRepository.getAccessByUserId(userId);

  if (access) {
    throw Boom.notFound(message.error.access.userExists);
  }

  return true;
};

exports.throwErrorIfAccessUserDoesNotExist = async (userId) => {
  const access = await accessRepository.getAccessByUserId(userId);

  if (!access) {
    throw Boom.notFound(message.error.access.userAccessNotFound);
  }

  return access;
};
