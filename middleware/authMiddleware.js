const asyncHandler = require("express-async-handler");
const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");

// Repositories
const userValidation = require("../modules/user/user.validation");

// Utilities
const resolveEffectiveAccess = require("../common/utils/resolveEffectiveAccess");

// Constants
const { MESSAGE: message } = require("../common/constants");

// Environment variables
const { env } = require("../config");

const protect = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw Boom.unauthorized(`${message.error.auth.unauthorized}, no token provided`);
  }

  const [scheme, token] = accessToken.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw Boom.unauthorized(`${message.error.auth.unauthorized}, invalid authorization header`);
  }

  try {
    const decoded = jwt.verify(token, env.JWT.ACCESS_TOKEN_SECRET);

    req.context = {};
    req.context.user = await userValidation.throwErrorIfUserDoesNotExist(decoded.id);

    next();
  } catch (error) {
    console.log(error);

    throw Boom.unauthorized(message.error.auth.unauthorized);
  }
});

module.exports = protect;
