const Boom = require("@hapi/boom");
const asyncHandler = require("express-async-handler");

// Validations
const userValidation = require("../modules/user/user.validation");

// Constants
const { MESSAGE: message, ROLES } = require("../common/constants");

const requireSuperAdminAccess = asyncHandler(async (req, res, next) => {
  const user = await userValidation.throwErrorIfUserDoesNotExist(req.context?.user?._id);

  if (user.platformRole !== ROLES.PLATFORM_ROLES.SUPER_ADMIN) {
    throw Boom.unauthorized(message.error.auth.unauthorized);
  }

  next();
});

module.exports = requireSuperAdminAccess;
