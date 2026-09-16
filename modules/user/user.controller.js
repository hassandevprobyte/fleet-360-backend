const asyncHandler = require("express-async-handler");

// Services
const userService = require("./user.service");

// Utilities
const transformQueryParams = require("../../utils/transformQueryToMongooseSyntax");

// Scope
const userScope = require("./user.scope");

// @desc    Get all users
// @route   GET /api/v1/users/all
// @access  Private
exports.getAllUsers = asyncHandler(async (req, res) => {
  const scopeQuery = userScope.scope(req.user, req.query.query?.roles);

  if (req.query?.query?.company) {
    req.query.query.companies = req.query.query.company;

    delete req.query.query.company;
  }

  const filters = transformQueryParams("User", { ...scopeQuery, ...req.query.query });

  const data = await userService.getAllUsers(filters);

  res.status(200).json(data);
});

// @desc    Get users with pagination
// @route   GET /api/v1/users
// @access  Private
exports.getUsersWithPagination = asyncHandler(async (req, res) => {
  const scopeQuery = userScope.scope(req.user, req.query.query?.roles);

  if (req.query?.query?.company) {
    req.query.query.companies = req.query.query.company;

    delete req.query.query.company;
  }

  const payload = {
    filters: transformQueryParams("User", { ...scopeQuery, ...req.query.query }),
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
  await userScope.authorizeByScope(req.user, req.params.id);

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
    companies: req.body.companies,
    brands: req.body.brands,
    roles: req.body.roles,
    isActive: req.body.isActive,
  };

  const data = await userService.createUser(payload);

  res.status(201).json(data);
});

// @desc    Update user
// @route   PATCH /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res) => {
  await userScope.authorizeByScope(req.user, req.params.id);

  const payload = {
    id: req.params.id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    companies: req.body.companies,
    brands: req.body.brands,
    roles: req.body.roles,
    isActive: req.body.isActive,
  };

  const data = await userService.updateUser(payload);

  res.status(200).json(data);
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = asyncHandler(async (req, res) => {
  await userScope.authorizeByScope(req.user, req.params.id);

  const data = await userService.deleteUser(req.params.id);

  res.status(200).json(data);
});
