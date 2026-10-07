const lodash = require("lodash");

// Repositories
const accessRepository = require("./access.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./access.schema");
const accessValidation = require("./access.validation");
const roleValidation = require("../role/role.validation");

// Utilities
const { core360Get } = require("../../utils/core360");

exports.getAllAccess = async (filters) => {
  return accessRepository.getAllAccess(filters);
};

exports.getAccessWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [accesss, totalCount] = await Promise.all([accessRepository.getAccessWithPagination(filters, offset, pageSize, sort), accessRepository.getAccessCount(filters)]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: accesss, meta };
};

exports.getAccessById = async (accessId) => {
  joi.validate(accessId, joiSchema.getAccessById);

  return accessValidation.throwErrorIfAccessDoesNotExist(accessId);
};

exports.getUsersForAccess = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.getUsersForAccess);

  const users = await core360Get("/public/users", validatedPayload.accessToken);

  return users.map((user) => {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      companies: user.companies,
      brands: user.brands,
      isActive: user.isActive,
    };
  });
};

exports.createAccess = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createAccess);

  await accessValidation.throwErrorIfAccessUserExists(validatedPayload.user);

  await roleValidation.throwErrorIfRoleDoesNotExist(validatedPayload.roles);

  return accessRepository.createAccess(validatedPayload);
};

exports.updateAccess = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateAccess);

  const existingAccess = await accessValidation.throwErrorIfAccessDoesNotExist(validatedPayload.id);

  const updatePayload = {};

  if (validatedPayload.user && validatedPayload.user !== String(existingAccess.user._id)) {
    updatePayload.user = validatedPayload.user;
  }

  if (validatedPayload.roles && !lodash.isEqual(validatedPayload.roles, existingAccess.roles)) {
    await roleValidation.throwErrorIfRoleDoesNotExist(validatedPayload.roles);
    updatePayload.roles = validatedPayload.roles;
  }

  return accessRepository.updateAccessById(validatedPayload.id, updatePayload);
};

exports.deleteAccess = async (accessId) => {
  joi.validate(accessId, joiSchema.getAccessById);

  await accessValidation.throwErrorIfAccessDoesNotExist(accessId);

  await accessRepository.deleteAccessById(accessId);

  return { deletedId: accessId };
};
