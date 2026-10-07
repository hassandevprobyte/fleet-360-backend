const jwt = require("jsonwebtoken");
const Boom = require("@hapi/boom");

// Validations
const accessValidation = require("../modules/access/access.validation");

// Constants
const message = require("../constants/MESSAGE");

// Utilities
const resolveEffectiveAccess = require("../utils/resolveEffectiveAccess");
const getSigningKey = require("../utils/getSigningKey");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.cookies?.accessToken;

    if (!authHeader) {
      throw Boom.unauthorized("Access token is required");
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw Boom.unauthorized("Invalid authorization header");
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getSigningKey,
        {
          algorithms: ["RS256"],
          issuer: "https://auth360.com",
          audience: "https://auth360.com",
        },
        (error, decodedToken) => {
          if (error) {
            return reject(error);
          }

          resolve(decodedToken);
        },
      );
    });

    const data = await accessValidation.throwErrorIfAccessUserDoesNotExist(decoded.sub?.id);
    const effectiveAccess = resolveEffectiveAccess(data.roles);

    const userPayload = {
      ...decoded.sub,
      effectivePermissions: effectiveAccess.effectivePermissions,
      effectiveScope: effectiveAccess.effectiveScope,
      indexPath: effectiveAccess.indexPath,
    };

    req.user = userPayload;
    // console.log("User => ", req.user);

    next();
  } catch (error) {
    return next(error || Boom.unauthorized("Invalid or expired access token"));
  }
};

module.exports = authenticate;
