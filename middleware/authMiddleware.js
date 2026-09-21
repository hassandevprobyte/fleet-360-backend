// const asyncHandler = require("express-async-handler");
// const Boom = require("@hapi/boom");
// const jwt = require("jsonwebtoken");

// // Repositories
// const userRepository = require("../modules/user/user.repository");

// // Utilities
// const resolveEffectiveAccess = require("../utils/resolveEffectiveAccess");

// // Constants
// const message = require("../constants/MESSAGE");

// // Environment variables
// const { env } = require("../config");

// const protect = asyncHandler(async (req, res, next) => {
//   const [scheme, token] = req.cookies?.accessToken?.split(" ") || [];

//   if (scheme !== "Bearer" || !token) {
//     throw Boom.unauthorized(`${message.error.auth.unauthorized}, no token provided`);
//   }

//   try {
//     const decoded = jwt.verify(token, env.JWT.ACCESS_TOKEN_SECRET);

//     req.user = await userRepository.getUserById(decoded.id);

//     req.user.companyIds = req.user.companies?.map((v) => String(v._id)) || [];
//     req.user.brandIds = req.user.brands?.map((v) => String(v._id)) || [];
//     req.user.roleIds = req.user.roles?.map((v) => String(v._id)) || [];

//     const effectiveAccess = resolveEffectiveAccess(req.user.roles);

//     req.user.effectivePermissions = effectiveAccess.effectivePermissions;
//     req.user.effectiveScope = effectiveAccess.effectiveScope;

//     next();
//   } catch (error) {
//     console.log(error);

//     throw Boom.unauthorized(message.error.auth.unauthorized);
//   }
// });

// module.exports = protect;
