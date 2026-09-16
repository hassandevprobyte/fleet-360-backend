const Boom = require("@hapi/boom");

// Constants
const message = require("../constants/MESSAGE");
const METHOD_TO_ACTION = {
  GET: "read",
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

const checkPermissions = (resource) => (req, res, next) => {
  const { user } = req;

  if (!user?.effectivePermissions) {
    throw Boom.unauthorized(message.error.auth.unauthorized);
  }

  const permission = user.effectivePermissions.find((p) => p.resource.toLowerCase() === resource.toLowerCase());
  const action = METHOD_TO_ACTION[req.method.toUpperCase()];

  if (permission && permission.actions.includes(action)) {
    return next();
  }

  throw Boom.forbidden(message.error.auth.forbidden);
};

module.exports = checkPermissions;
