const asyncHandler = require("express-async-handler");

// Services
const taxationService = require("./taxation.service");

// @desc    Get all taxation
// @route   GET /api/v1/taxation/all
// @access  Private
exports.getAllTaxation = asyncHandler(async (req, res) => {
  const data = await taxationService.getAllTaxation(req.filters);

  res.status(200).json(data);
});

// @desc    Get taxation with pagination
// @route   GET /api/v1/taxation
// @access  Private
exports.getTaxationWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await taxationService.getTaxationWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get taxation by id
// @route   GET /api/v1/taxation/:id
// @access  Private
exports.getTaxationById = asyncHandler(async (req, res) => {
  const data = await taxationService.getTaxationById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new taxation
// @route   POST /api/v1/taxation
// @access  Private
exports.createTaxation = asyncHandler(async (req, res) => {
  const taxationPayload = {
    fleet: req.body.fleet,
    challanNumber: req.body.challanNumber,
    jurisdiction: req.body.jurisdiction,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    filingDate: req.body.filingDate,
    amount: req.body.amount,
    notes: req.body.notes,
    // createdBy: req.user._id,
  };

  const attachmentPayload = {
    documents: req.files.documents,
    // uploadedBy: req.user._id,
  };

  const data = await taxationService.createTaxation(taxationPayload, attachmentPayload);

  res.status(201).json(data);
});

// @desc    Update taxation
// @route   PATCH /api/v1/taxation/:id
// @access  Private
exports.updateTaxation = asyncHandler(async (req, res) => {
  const payload = {
    id: req.params.id,
    fleet: req.body.fleet,
    challanNumber: req.body.challanNumber,
    jurisdiction: req.body.jurisdiction,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    filingDate: req.body.filingDate,
    amount: req.body.amount,
    notes: req.body.notes,
  };

  const attachmentPayload = {
    documents: req.files.documents,
    // uploadedBy: req.user._id,
  };

  const data = await taxationService.updateTaxation(payload, attachmentPayload);

  res.status(200).json(data);
});

// @desc    Delete taxation
// @route   DELETE /api/v1/taxation/:id
// @access  Private
exports.deleteTaxation = asyncHandler(async (req, res) => {
  const data = await taxationService.deleteTaxation(req.params.id);

  res.status(200).json(data);
});
