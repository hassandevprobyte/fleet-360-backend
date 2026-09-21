const asyncHandler = require("express-async-handler");

// Services
const depreciationService = require("./depreciation.service");

// @desc    Get all depreciations
// @route   GET /api/v1/depreciations/all
// @access  Private
exports.getAllDepreciations = asyncHandler(async (req, res) => {
  const data = await depreciationService.getAllDepreciations(req.filters);

  res.status(200).json(data);
});

// @desc    Get depreciations with pagination
// @route   GET /api/v1/depreciations
// @access  Private
exports.getDepreciationsWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await depreciationService.getDepreciationsWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get depreciations summary by group
// @route   GET /api/v1/depreciations/summary/byGroup
// @access  Private
exports.getDepreciationsSummaryByGroup = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    primaryGroup: req.query.primaryGroup,
    secondaryGroup: req.query.secondaryGroup,
  };

  const data = await depreciationService.getDepreciationsSummaryByGroup(payload);

  res.status(200).json(data);
});

// @desc    Get depreciation by id
// @route   GET /api/v1/depreciations/:id
// @access  Private
exports.getDepreciationById = asyncHandler(async (req, res) => {
  const data = await depreciationService.getDepreciationById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new depreciation
// @route   POST /api/v1/depreciations
// @access  Private
exports.createDepreciation = asyncHandler(async (req, res) => {
  const payload = {
    fleet: req.body.fleet,
    method: req.body.method,
    salvageValue: req.body.salvageValue,
    usefulLifeMonths: req.body.usefulLifeMonths,
    depreciationRate: req.body.depreciationRate,
    acquisitionCost: req.body.acquisitionCost,
    totalAcquiredUnits: req.body.totalAcquiredUnits,
    totalExpectedUnits: req.body.totalExpectedUnits,
    startDate: req.body.startDate,
  };

  const data = await depreciationService.createDepreciation(payload);

  res.status(201).json(data);
});

// @desc    Update depreciation
// @route   PATCH /api/v1/depreciations/:id
// @access  Private
exports.updateDepreciation = asyncHandler(async (req, res) => {
  const payload = {
    id: req.params.id,
    fleet: req.body.fleet,
    method: req.body.method,
    salvageValue: req.body.salvageValue,
    usefulLifeMonths: req.body.usefulLifeMonths,
    depreciationRate: req.body.depreciationRate,
    acquisitionCost: req.body.acquisitionCost,
    totalAcquiredUnits: req.body.totalAcquiredUnits,
    totalExpectedUnits: req.body.totalExpectedUnits,
    startDate: req.body.startDate,
  };

  const data = await depreciationService.updateDepreciation(payload);

  res.status(200).json(data);
});

// @desc    Delete depreciation
// @route   DELETE /api/v1/depreciations/:id
// @access  Private
exports.deleteDepreciation = asyncHandler(async (req, res) => {
  const data = await depreciationService.deleteDepreciation(req.params.id);

  res.status(200).json(data);
});
