const bcrypt = require("bcrypt");
const lodash = require("lodash");

// Repository
const userRepository = require("./user.repository");

// Validations
const joi = require("../../config/joi");
const joiSchema = require("./user.schema");
const roleValidation = require("../role/role.validation");
const userValidation = require("./user.validation");

exports.getAllUsers = async (filters) => {
  return userRepository.getAllUsers(filters);
};

exports.getUsersWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [users, totalCount] = await Promise.all([userRepository.getUsersWithPagination(filters, offset, pageSize, sort), userRepository.getUsersCount(filters)]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: users, meta };
};

exports.getUserById = async (userId) => {
  joi.validate(userId, joiSchema.getUserById);

  return userValidation.throwErrorIfUserDoesNotExist(userId);
};

exports.createUser = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createUser);

  await userValidation.throwErrorIfUserEmailExists(validatedPayload.email);

  if (validatedPayload.roles) {
    await roleValidation.throwErrorIfAnyRoleDoesNotExist(validatedPayload.roles);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(validatedPayload.password, salt);

  const createPayload = { ...validatedPayload, password: hashedPassword };

  return userRepository.createUser(createPayload);
};

exports.updateUser = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateUser);

  const existingUser = await userValidation.throwErrorIfUserDoesNotExist(validatedPayload.id);
  const updatePayload = {};

  if (validatedPayload.name && existingUser.name !== validatedPayload.name) {
    updatePayload.name = validatedPayload.name;
  }

  if (validatedPayload.email && existingUser.email !== validatedPayload.email) {
    await userValidation.throwErrorIfUserEmailExists(validatedPayload.email);

    updatePayload.email = validatedPayload.email;
  }

  if (validatedPayload.password) {
    const oldPassword = await userRepository.getUserPasswordById(existingUser._id);

    const compare = await bcrypt.compare(validatedPayload.password, oldPassword);

    if (!compare) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedPayload.password, salt);

      updatePayload.password = hashedPassword;
    }
  }

  if (validatedPayload.platformRole && validatedPayload.platformRole !== existingUser.platformRole) {
    updatePayload.platformRole = validatedPayload.platformRole;
  }

  if (validatedPayload.workspaceRole && validatedPayload.workspaceRole !== existingUser.workspaceRole) {
    updatePayload.workspaceRole = validatedPayload.workspaceRole;
  }

  if (validatedPayload.permissions && !lodash.isEqual(validatedPayload.permissions, existingUser.permissions)) {
    updatePayload.permissions = validatedPayload.permissions;
  }

  if (validatedPayload.hasOwnProperty("isActive") && validatedPayload.isActive !== existingUser.isActive) {
    updatePayload.isActive = validatedPayload.isActive;
  }

  if (validatedPayload.hasOwnProperty("isEmailVerified") && validatedPayload.isEmailVerified !== existingUser.isEmailVerified) {
    updatePayload.isEmailVerified = validatedPayload.isEmailVerified;
  }

  if (validatedPayload.emailVerifiedAt && validatedPayload.emailVerifiedAt !== existingUser.emailVerifiedAt) {
    updatePayload.emailVerifiedAt = validatedPayload.emailVerifiedAt;
  }

  if (!Object.keys(updatePayload).length) return existingUser;

  return userRepository.updateUserById(validatedPayload.id, updatePayload);
};

exports.deleteUser = async (userId) => {
  joi.validate(userId, joiSchema.getUserById);

  await userValidation.throwErrorIfUserDoesNotExist(userId);

  await userRepository.deleteUserById(userId);
  return { deletedId: userId };
};
