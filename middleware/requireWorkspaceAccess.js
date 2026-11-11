const Boom = require("@hapi/boom");
const asyncHandler = require("express-async-handler");

// Validations
const userValidation = require("../modules/user/user.validation");
const workspaceValidation = require("../modules/workspace/workspace.validation");

// Constants
const { MESSAGE: message, ROLES, STATUSES } = require("../common/constants");

const requireWorkspaceAccess = asyncHandler(async (req, res, next) => {
  const workspace = await workspaceValidation.throwErrorIfWorkspaceSlugDoesNotExist(req.params.slug);

  if (workspace.status !== STATUSES.WORKSPACE.ACTIVE) {
    throw Boom.forbidden(`This workspace is ${workspace.status}`);
  }

  const user = await userValidation.throwErrorIfUserDoesNotExist(req.context?.user?._id);

  const isOwner = workspace.user._id.equals(user._id);
  const isMember = workspace.members.some((member) => member.user._id.equals(user._id));
  const isSuperAdmin = user.platformRole === ROLES.PLATFORM_ROLES.SUPER_ADMIN;

  if (!isSuperAdmin && !isOwner && !isMember) {
    throw Boom.forbidden(message.error.auth.forbidden);
  }

  req.context.workspace = workspace;
  req.context.workspaceId = String(workspace._id);
  req.context.permissions = user.permissions;

  return next();
});

module.exports = requireWorkspaceAccess;
