const lodash = require("lodash");

// Repositories
const workspaceRepository = require("./workspace.repository");

// Validations
const joi = require("../../config/joi");
const joiSchema = require("./workspace.schema");
const workspaceValidation = require("./workspace.validation");

// Helpers
const workspaceHelpers = require("./workspace.helper");

// Environment Variables
const { env } = require("../../config");

exports.getAllWorkspaces = async (filters) => {
  return workspaceRepository.getAllWorkspaces(filters);
};

exports.getWorkspacesWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [workspaces, totalCount] = await Promise.all([
    workspaceRepository.getWorkspacesWithPagination(filters, offset, pageSize, sort),
    workspaceRepository.getWorkspacesCount(filters),
  ]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };
  return { data: workspaces, meta };
};

exports.getWorkspaceById = async (workspaceId) => {
  joi.validate(workspaceId, joiSchema.getWorkspaceById);

  return workspaceValidation.throwErrorIfWorkspaceDoesNotExist(workspaceId);
};

exports.getWorkspaceBySlug = async (slug) => {
  joi.validate(slug, joiSchema.getWorkspaceBySlug);

  return workspaceValidation.throwErrorIfWorkspaceSlugDoesNotExist(slug);
};

exports.createWorkspace = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createWorkspace);

  await workspaceValidation.throwErrorIfWorkspaceUserExists(validatedPayload.user);

  validatedPayload.slug = workspaceHelpers.generateWorkspaceSlug(env.WORKSPACE.SLUG_LENGTH);

  return workspaceRepository.createWorkspace(validatedPayload);
};

exports.updateWorkspace = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateWorkspace);

  const existingWorkspace = await workspaceValidation.throwErrorIfWorkspaceDoesNotExist(validatedPayload.id);
  const updatePayload = {};

  if (validatedPayload.title && validatedPayload.title !== existingWorkspace?.title) {
    updatePayload.title = validatedPayload.title;
  }

  if (validatedPayload.description && validatedPayload.description !== existingWorkspace?.description) {
    updatePayload.description = validatedPayload.description;
  }

  if (validatedPayload.color && validatedPayload.color !== existingWorkspace?.color) {
    updatePayload.color = validatedPayload.color;
  }

  if (validatedPayload.status && validatedPayload.status !== existingWorkspace?.status) {
    updatePayload.status = validatedPayload.status;
  }

  if (validatedPayload.members && !lodash.isEqual(validatedPayload.members, existingWorkspace?.members)) {
    updatePayload.members = validatedPayload.members;
  }

  if (validatedPayload.settings && !lodash.isEqual(validatedPayload.settings, existingWorkspace?.settings)) {
    updatePayload.settings = validatedPayload.settings;
  }

  if (!Object.keys(updatePayload).length) return existingWorkspace;

  return workspaceRepository.updateWorkspaceById(validatedPayload.id, updatePayload);
};

exports.updateWorkspaceBySlug = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateWorkspaceBySlug);

  const existingWorkspace = await workspaceValidation.throwErrorIfWorkspaceSlugDoesNotExist(validatedPayload.slug);
  const updatePayload = {};

  if (validatedPayload.title && validatedPayload.title !== existingWorkspace?.title) {
    updatePayload.title = validatedPayload.title;
  }

  if (validatedPayload.description && validatedPayload.description !== existingWorkspace?.description) {
    updatePayload.description = validatedPayload.description;
  }

  if (validatedPayload.color && validatedPayload.color !== existingWorkspace?.color) {
    updatePayload.color = validatedPayload.color;
  }

  if (validatedPayload.status && validatedPayload.status !== existingWorkspace?.status) {
    updatePayload.status = validatedPayload.status;
  }

  if (validatedPayload.members && !lodash.isEqual(validatedPayload.members, existingWorkspace?.members)) {
    updatePayload.members = validatedPayload.members;
  }

  if (validatedPayload.settings && !lodash.isEqual(validatedPayload.settings, existingWorkspace?.settings)) {
    updatePayload.settings = validatedPayload.settings;
  }

  if (!Object.keys(updatePayload).length) return existingWorkspace;

  return workspaceRepository.updateWorkspaceById(existingWorkspace._id, updatePayload);
};

exports.deleteWorkspace = async (workspaceId) => {
  joi.validate(workspaceId, joiSchema.getWorkspaceById);

  await workspaceValidation.throwErrorIfWorkspaceDoesNotExist(workspaceId);

  await workspaceRepository.deleteWorkspaceById(workspaceId);

  return { deletedId: workspaceId };
};

