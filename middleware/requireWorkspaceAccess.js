const Boom = require("@hapi/boom");
const asyncHandler = require("express-async-handler");

// Validations
const userValidation = require("../modules/user/user.validation");
const workspaceValidation = require("../modules/workspace/workspace.validation");

// Constants
const { MESSAGE: message, STATUSES } = require("../common/constants");

const requireWorkspaceAccess = asyncHandler(async (req, res, next) => {
  const workspace = await workspaceValidation.throwErrorIfWorkspaceSlugDoesNotExist(req.params.slug);

  if (workspace.status !== STATUSES.WORKSPACE.ACTIVE) {
    throw Boom.unauthorized(`Access forbidden, This workspace is ${workspace.status}`);
  }

  const user = await userValidation.throwErrorIfUserDoesNotExist(req.context?.user?._id);

  const isOwner = workspace.user._id.equals(user._id);
  const isMember = workspace.members.some((member) => member.user._id.equals(user._id));

  if (!isOwner && !isMember) {
    throw Boom.unauthorized(message.error.auth.unauthorized);
  }

  req.context.workspace = workspace;
  req.context.workspaceId = workspace._id;
  req.context.permissions = user.permissions;
  next();
});

module.exports = requireWorkspaceAccess;
