const bcrypt = require("bcrypt");
const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");

// Repositories
const userRepository = require("../user/user.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./auth.schema");
const authValidation = require("./auth.validation");
const userValidation = require("../user/user.validation");

// Configs
const { env } = require("../../config");

// Utilities
const resolveEffectiveAccess = require("../../utils/resolveEffectiveAccess");

// Constants
const message = require("../../constants/MESSAGE");

exports.login = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.login);

  const user = await authValidation.throwErrorIfUserEmailDoesNotExist(validatedPayload.email);
  await user.populate("roles");

  authValidation.throwErrorIfUserIsInactive(user);
  await authValidation.throwErrorIfPasswordIncorrect(validatedPayload.password, user.password);

  const effectiveAccess = resolveEffectiveAccess(user.roles);

  const userPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
    effectivePermissions: effectiveAccess.effectivePermissions,
    effectiveScope: effectiveAccess.effectiveScope,
    indexPath: effectiveAccess.indexPath,
  };

  // Tokens
  const accessToken = `Bearer ${jwt.sign({ id: user._id }, env.JWT.ACCESS_TOKEN_SECRET, { expiresIn: "7d" })}`;
  const refreshToken = `Bearer ${jwt.sign({ id: user._id }, env.JWT.REFRESH_TOKEN_SECRET, { expiresIn: "30d" })}`;

  return { user: userPayload, accessToken, refreshToken };
};

exports.refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw Boom.unauthorized(message.error.auth.unauthorized);
  }

  const decoded = jwt.verify(refreshToken, env.JWT.REFRESH_TOKEN_SECRET);

  const user = await userValidation.throwErrorIfUserDoesNotExist(decoded.id);

  authValidation.throwErrorIfUserIsInactive(user);

  const accessToken = `Bearer ${jwt.sign({ id: user._id }, env.JWT.ACCESS_TOKEN_SECRET, { expiresIn: "7d" })}`;

  return { accessToken };
};

exports.changePassword = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.changePassword);

  const userPassword = await userRepository.getUserPasswordById(validatedPayload.id);

  await authValidation.throwErrorIfPasswordIncorrect(validatedPayload.oldPassword, userPassword);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(validatedPayload.newPassword, salt);

  const updatePayload = { password: hashedPassword };

  return userRepository.updateUserById(validatedPayload.id, updatePayload);
};
