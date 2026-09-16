const mongoose = require("mongoose");

// Repositories
const roleRepository = require("./role.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./role.schema");
const roleValidation = require("./role.validation");

// Constants
const CRUD = require("../../constants/CRUD");
const SCOPE = require("../../constants/SCOPE");

exports.getAllRoles = async (filters) => {
  return roleRepository.getAllRoles(filters);
};

exports.getRolesWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [roles, totalCount] = await Promise.all([roleRepository.getRolesWithPagination(filters, offset, pageSize, sort), roleRepository.getRolesCount(filters)]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: roles, meta };
};

exports.getAllResources = () => {
  const resources = mongoose.modelNames();

  const excludeUpdateFields = ["_id", "__v", "updatedAt"];

  const allowedUpdateFields = (resource) => Object.keys(mongoose.model(resource).schema.paths).filter((field) => !excludeUpdateFields.includes(field));

  const actions = Object.values(CRUD);

  return resources.sort().map((resource) => ({ resource, allowedUpdateFields: allowedUpdateFields(resource), actions }));
};

exports.getAllScopes = () => {
  return Object.values(SCOPE).map((e) => ({ label: e, value: e }));
};

exports.getRoleById = async (roleId) => {
  joi.validate(roleId, joiSchema.getRoleById);

  return roleValidation.throwErrorIfRoleDoesNotExist(roleId);
};

exports.createRole = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createRole);

  await roleValidation.throwErrorIfRoleTitleExists(validatedPayload.title);

  return roleRepository.createRole(validatedPayload);
};

exports.updateRole = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateRole);

  const existingRole = await roleValidation.throwErrorIfRoleDoesNotExist(validatedPayload.id);

  if (validatedPayload.title && existingRole.title !== validatedPayload.title) {
    await roleValidation.throwErrorIfRoleTitleExists(validatedPayload.title);
  }

  return roleRepository.updateRoleById(validatedPayload.id, validatedPayload);
};

exports.deleteRole = async (roleId) => {
  joi.validate(roleId, joiSchema.getRoleById);

  await Promise.all([roleValidation.throwErrorIfRoleDoesNotExist(roleId), roleValidation.throwErrorIfRoleIsAssignedOnUser(roleId)]);

  await roleRepository.deleteRoleById(roleId);

  return { deletedId: roleId };
};
