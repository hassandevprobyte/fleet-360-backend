const Boom = require("@hapi/boom");

// Constants
const { MESSAGE: message, ROLES } = require("../common/constants");

const METHOD_TO_ACTION = Object.freeze({
  GET: "read",
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
});

const checkPermissions = (resource) => (req, res, next) => {
  const { user, permissions = [] } = req.context || {};

  if (user.platformRole === ROLES.PLATFORM_ROLES.SUPER_ADMIN) {
    return next();
  }

  const action = METHOD_TO_ACTION[req.method];

  if (!action) {
    throw Boom.unauthorized(message.error.auth.unauthorized);
  }

  const requiredPermission = `${resource.toLowerCase()}:${action}`;

  if (permissions.includes(requiredPermission)) {
    return next();
  }

  throw Boom.forbidden(message.error.auth.forbidden);
};

module.exports = checkPermissions;
