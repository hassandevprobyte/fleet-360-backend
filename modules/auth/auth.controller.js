const asyncHandler = require("express-async-handler");

// Services
const authService = require("./auth.service");

// Configs
const { env } = require("../../config");

// @desc    Authenticate user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const payload = {
    email: req.body.email,
    password: req.body.password,
  };

  const { accessToken, refreshToken, user } = await authService.login(payload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json(user);
});

// @desc    Refresh auth token
// @route   GET /api/v1/auth/refresh
// @access  Public
exports.refresh = asyncHandler(async (req, res) => {
  const { accessToken } = await authService.refresh(req.cookies?.refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({ message: "Token refreshed successfully" });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res) => {
  if (!req.cookies?.refreshToken || !req.cookies?.accessToken) return res.sendStatus(204);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Change user password
// @route   PATCH /api/v1/auth/changePassword
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const payload = { id: req.user._id, oldPassword: req.body.oldPassword, newPassword: req.body.newPassword };
  const user = await authService.changePassword(payload);

  res.status(200).json(user);
});
