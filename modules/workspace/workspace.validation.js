const Boom = require("@hapi/boom");

// Repositories
const workspaceRepository = require("./workspace.repository");

// Constants
const { MESSAGE: message } = require("../../common/constants");

exports.throwErrorIfWorkspaceDoesNotExist = async (workspaceId) => {
  const workspace = await workspaceRepository.getWorkspaceById(workspaceId);

  if (!workspace) {
    throw Boom.notFound(message.error.workspace.notFound);
  }

  return workspace;
};

exports.throwErrorIfWorkspaceExists = async (workspaceId) => {
  const workspace = await workspaceRepository.getWorkspaceById(workspaceId);

  if (workspace) {
    throw Boom.conflict(message.error.workspace.alreadyExists);
  }
};

exports.throwErrorIfWorkspaceUserExists = async (userId) => {
  const workspace = await workspaceRepository.getWorkspaceByUserId(userId);

  if (workspace) {
    throw Boom.conflict(message.error.workspace.alreadyExists);
  }
};

exports.throwErrorIfWorkspaceSlugDoesNotExist = async (slug) => {
  const workspace = await workspaceRepository.getWorkspaceBySlug(slug);

  if (!workspace) {
    throw Boom.notFound(message.error.workspace.notFound);
  }

  return workspace;
};

exports.throwErrorIfWorkspaceSlugExists = async (slug) => {
  const workspace = await workspaceRepository.getWorkspaceBySlug(slug);

  if (workspace) {
    throw Boom.notFound(message.error.workspace.slugExists);
  }
};
