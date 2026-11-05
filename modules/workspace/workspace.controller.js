const asyncHandler = require("express-async-handler");

// Services
const workspaceService = require("./workspace.service");

// @desc    Get all workspace
// @route   GET /api/v1/workspaces/all
// @access  Private
exports.getAllWorkspaces = asyncHandler(async (req, res) => {
  const data = await workspaceService.getAllWorkspaces(req.filters);

  res.status(200).json(data);
});

// @desc    Get workspace with pagination
// @route   GET /api/v1/workspaces
// @access  Private
exports.getWorkspacesWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await workspaceService.getWorkspacesWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get workspace by id
// @route   GET /api/v1/workspaces/:id
// @access  Private
exports.getWorkspaceById = asyncHandler(async (req, res) => {
  const data = await workspaceService.getWorkspaceById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new workspace
// @route   POST /api/v1/workspace
// @access  Private
exports.createWorkspace = asyncHandler(async (req, res) => {
  const payload = {
    user: req.context?.user?._id,
    title: req.body.title,
    description: req.body.description,
    slug: req.body.slug,
    color: req.body.color,
    status: req.body.status,
    depreciation: req.body.depreciation,
    members: req.body.members,
    settings: req.body.settings,
  };

  const data = await workspaceService.createWorkspace(payload);

  res.status(201).json(data);
});

// @desc    Update workspace
// @route   PATCH /api/v1/workspaces/:id
// @access  Private
exports.updateWorkspace = asyncHandler(async (req, res) => {
  const payload = {
    id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    slug: req.body.slug,
    color: req.body.color,
    status: req.body.status,
    depreciation: req.body.depreciation,
    members: req.body.members,
    settings: req.body.settings,
  };

  const data = await workspaceService.updateWorkspace(payload);

  res.status(200).json(data);
});

// @desc    Delete workspace
// @route   DELETE /api/v1/workspaces/:id
// @access  Private
exports.deleteWorkspace = asyncHandler(async (req, res) => {
  const data = await workspaceService.deleteWorkspace(req.params.id);

  res.status(200).json(data);
});
