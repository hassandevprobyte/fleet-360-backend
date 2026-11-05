const asyncHandler = require("express-async-handler");

// Services
const userService = require("./user.service");

// Utilities
const transformQueryParams = require("../../common/utils/transformQueryToMongooseSyntax");

// Scope
const userScope = require("./user.scope");

// @desc    Get all users
// @route   GET /api/v1/users/all
// @access  Private
exports.getAllUsers = asyncHandler(async (req, res) => {
  // const scopeQuery = userScope.scope(req.context?.user, req.query.query?.roles);

  const filters = transformQueryParams("User", { ...req.query.query });

  const data = await userService.getAllUsers(filters);

  res.status(200).json(data);
});

// @desc    Get users with pagination
// @route   GET /api/v1/users
// @access  Private
exports.getUsersWithPagination = asyncHandler(async (req, res) => {
  // const scopeQuery = userScope.scope(req.context?.user, req.query.query?.roles);

  const payload = {
    filters: transformQueryParams("User", { ...req.query.query }),
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await userService.getUsersWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get user by id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUserById = asyncHandler(async (req, res) => {
  // await userScope.authorizeByScope(req.context?.user, req.params.id);

  const data = await userService.getUserById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new user
// @route   POST /api/v1/users
// @access  Private
exports.createUser = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    platformRole: req.body.platformRole,
    workspaceRole: req.body.workspaceRole,
    permissions: req.body.permissions,
    status: req.body.status,
    isActive: req.body.isActive,
    isEmailVerified: req.body.isEmailVerified,
    emailVerifiedAt: req.body.emailVerifiedAt,
  };

  const data = await userService.createUser(payload);

  res.status(201).json(data);
});

// @desc    Update user
// @route   PATCH /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res) => {
  // await userScope.authorizeByScope(req.context?.user, req.params.id);

  const payload = {
    id: req.params.id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    platformRole: req.body.platformRole,
    workspaceRole: req.body.workspaceRole,
    permissions: req.body.permissions,
    status: req.body.status,
    isActive: req.body.isActive,
    isEmailVerified: req.body.isEmailVerified,
    emailVerifiedAt: req.body.emailVerifiedAt,
  };

  const data = await userService.updateUser(payload);

  res.status(200).json(data);
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = asyncHandler(async (req, res) => {
  // await userScope.authorizeByScope(req.context?.user, req.params.id);

  const data = await userService.deleteUser(req.params.id);

  res.status(200).json(data);
});
