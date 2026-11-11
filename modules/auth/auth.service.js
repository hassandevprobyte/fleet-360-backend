const bcrypt = require("bcrypt");
const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");

// Services
const userService = require("../user/user.service");
const otpService = require("../otp/otp.service");
const workspaceService = require("../workspace/workspace.service");

// Repositories
const userRepository = require("../user/user.repository");

// Validations
const joi = require("../../config/joi");
const joiSchema = require("./auth.schema");
const authValidation = require("./auth.validation");
const userValidation = require("../user/user.validation");

// Environment Variables
const { env } = require("../../config");

// Constants
const { MESSAGE: message, PERMISSIONS, ROLES } = require("../../common/constants");

// Helpers
const emailHelpers = require("../../common/helpers/emailHelpers");

const getPermissions = (permissions) => Object.values(permissions).flatMap((value) => (typeof value === "object" ? getPermissions(value) : value));

exports.signup = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.signup);

  await userValidation.throwErrorIfUserEmailExists(validatedPayload.email);

  validatedPayload.platformRole = ROLES.PLATFORM_ROLES.USER;
  validatedPayload.workspaceRole = ROLES.WORKSPACE_ROLES.OWNER;

  validatedPayload.permissions = getPermissions(PERMISSIONS.WORKSPACE.OWNER);

  const user = await userService.createUser(validatedPayload);
  await workspaceService.createWorkspace({ user: user._id });

  const otp = await otpService.createOtp({ key: `${user._id}:otp` });

  const smtp = {
    host: env.SMTP.HOST,
    port: env.SMTP.PORT,
    user: env.SMTP.USER,
    pass: env.SMTP.PASSWORD,
  };

  const emailMessage = {
    to: user.email,
    from: smtp.user,
    subject: "Email Verification",
    html: `<p>Dear ${user.name},</p>
           <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
           <h2>${otp}</h2>
           <p>Best regards,<br>Fleet 360 Team</p>`,
    cc: [],
    bcc: [],
    priority: "high",
    headers: {
      Importance: "high",
      Priority: "urgent",
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
    },
    messageId: `<${Date.now()}-${user._id}-@${smtp.host}>`,
    date: new Date(),
  };

  await emailHelpers.sendMail(emailMessage, smtp);

  // Tokens
  const accessToken = `Bearer ${jwt.sign({ id: user._id }, env.JWT.ACCESS_TOKEN_SECRET, { expiresIn: "7d" })}`;
  const refreshToken = `Bearer ${jwt.sign({ id: user._id }, env.JWT.REFRESH_TOKEN_SECRET, { expiresIn: "30d" })}`;

  return { user, accessToken, refreshToken };
};

exports.verifyEmail = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.verifyEmail);

  await authValidation.throwErrorIfUserEmailIsVerified(validatedPayload.id);

  const otpPayload = {
    key: `${validatedPayload.id}:otp`,
    otp: validatedPayload.otp,
  };

  await otpService.verifyOtp(otpPayload);

  const updatePayload = { id: validatedPayload.id, isEmailVerified: true, emailVerifiedAt: new Date() };

  const user = await userService.updateUser(updatePayload);

  const response = user.toObject ? user.toObject() : { ...user };

  if (response.platformRole !== ROLES.PLATFORM_ROLES.SUPER_ADMIN) {
    const workspace = await authValidation.throwErrorIfUserWorkspaceDoesNotExist(response._id);

    response.slug = workspace.slug;
  }

  return response;
};

exports.resendOtp = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.resendOtp);

  const user = await userValidation.throwErrorIfUserDoesNotExist(validatedPayload.id);

  await authValidation.throwErrorIfUserEmailIsVerified(validatedPayload.id);

  const otp = await otpService.resendOtp({ key: `${user._id}:otp` });

  const smtp = {
    host: env.SMTP.HOST,
    port: env.SMTP.PORT,
    user: env.SMTP.USER,
    pass: env.SMTP.PASSWORD,
  };

  const emailMessage = {
    to: user.email,
    from: smtp.user,
    subject: "Email Verification",
    html: `<p>Dear ${user.name},</p>
           <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
           <h2>${otp}</h2>
           <p>Best regards,<br>Fleet 360 Team</p>`,
    cc: [],
    bcc: [],
    priority: "high",
    headers: {
      Importance: "high",
      Priority: "urgent",
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
    },
    messageId: `<${Date.now()}-${user._id}-@${smtp.host}>`,
    date: new Date(),
  };

  await emailHelpers.sendMail(emailMessage, smtp);

  return {
    success: true,
    message: "Otp sent successfully",
  };
};

exports.login = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.login);

  const user = await authValidation.throwErrorIfUserEmailDoesNotExist(validatedPayload.email);

  authValidation.throwErrorIfUserIsInactive(user);
  await authValidation.throwErrorIfPasswordIncorrect(validatedPayload.password, user.password);

  const { _id, ...userPayload } = user.toObject();
  userPayload.id = user._id;

  if (user.platformRole !== ROLES.PLATFORM_ROLES.SUPER_ADMIN) {
    const workspace = await authValidation.throwErrorIfUserWorkspaceDoesNotExist(user._id);
    userPayload.slug = workspace.slug;
  }

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
