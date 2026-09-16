const Boom = require("@hapi/boom");

// Repositories
const userRepository = require("./user.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfUserDoesNotExist = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw Boom.notFound(message.error.user.notFound);
  }

  return user;
};

exports.throwErrorIfUserDoesNotExistInBrand = async (userId, brandId) => {
  const user = await userRepository.getUserByIdAndBrandId(userId, brandId);

  if (!user) {
    throw Boom.notFound(message.error.user.notFoundInBrand);
  }

  return user;
};

exports.throwErrorIfUserDoesNotExistInCompany = async (userId, companyId) => {
  const user = await userRepository.getUserByIdAndCompanyId(userId, companyId);

  if (!user) {
    throw Boom.notFound(message.error.user.notFoundInCompany);
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

exports.throwErrorIfAnyUserDoesNotExistInBrand = async (userIds, brandId) => {
  const users = await userRepository.getUsersByIdsAndBrandId(userIds, brandId);

  if (users.length !== userIds.length) {
    throw Boom.notFound(message.error.user.notFoundInBrand);
  }

  return users;
};

exports.throwErrorIfAnyUserDoesNotExistInCompany = async (userIds, companyId) => {
  const users = await userRepository.getUsersByIdsAndCompanyId(userIds, companyId);

  if (users.length !== userIds.length) {
    throw Boom.notFound(message.error.user.notFoundInCompany);
  }

  return users;
};

exports.throwErrorIfUserEmailExists = async (email) => {
  const emailExists = await userRepository.getUserByEmail(email);

  if (emailExists) {
    throw Boom.conflict(message.error.user.emailExists);
  }
};
