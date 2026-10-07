const asyncHandler = require("express-async-handler");

// Services
const accessService = require("./access.service");

// @desc    Get all access
// @route   GET /api/v1/access/all
// @access  Private
exports.getAllAccess = asyncHandler(async (req, res) => {
  const data = await accessService.getAllAccess(req.filters);

  res.status(200).json(data);
});

// @desc    Get access with pagination
// @route   GET /api/v1/access
// @access  Private
exports.getAccessWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await accessService.getAccessWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get access by id
// @route   GET /api/v1/access/:id
// @access  Private
exports.getAccessById = asyncHandler(async (req, res) => {
  const data = await accessService.getAccessById(req.params.id);

  res.status(200).json(data);
});

// @desc    Get users for access
// @route   GET /api/v1/access/users
// @access  Private
exports.getUsersForAccess = asyncHandler(async (req, res) => {
  const payload = {
    accessToken: req.cookies.accessToken,
  };

  const data = await accessService.getUsersForAccess(payload);

  res.status(200).json(data);
});

// @desc    Create a new access
// @route   POST /api/v1/access
// @access  Private
exports.createAccess = asyncHandler(async (req, res) => {
  const payload = {
    user: req.body.user,
    roles: req.body.roles,
  };

  const data = await accessService.createAccess(payload);

  res.status(201).json(data);
});

// @desc    Update access
// @route   PATCH /api/v1/access/:id
// @access  Private
exports.updateAccess = asyncHandler(async (req, res) => {
  const payload = {
    id: req.params.id,
    user: req.body.user,
    roles: req.body.roles,
  };

  const data = await accessService.updateAccess(payload);

  res.status(200).json(data);
});

// @desc    Delete access
// @route   DELETE /api/v1/access/:id
// @access  Private
exports.deleteAccess = asyncHandler(async (req, res) => {
  const data = await accessService.deleteAccess(req.params.id);

  res.status(200).json(data);
});
