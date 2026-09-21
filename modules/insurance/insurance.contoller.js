const asyncHandler = require("express-async-handler");

// Services
const insuranceService = require("./insurance.service");

// @desc    Get all insurance
// @route   GET /api/v1/insurance/all
// @access  Private
exports.getAllInsurance = asyncHandler(async (req, res) => {
  const data = await insuranceService.getAllInsurance(req.filters);

  res.status(200).json(data);
});

// @desc    Get insurance with pagination
// @route   GET /api/v1/insurance
// @access  Private
exports.getInsuranceWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await insuranceService.getInsuranceWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get insurance by id
// @route   GET /api/v1/insurance/:id
// @access  Private
exports.getInsuranceById = asyncHandler(async (req, res) => {
  const data = await insuranceService.getInsuranceById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new insurance
// @route   POST /api/v1/insurance
// @access  Private
exports.createInsurance = asyncHandler(async (req, res) => {
  const insurancePayload = {
    company: req.body.company,
    fleet: req.body.fleet,
    policyNumber: req.body.policyNumber,
    provider: req.body.provider,
    status: req.body.status,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    cancellationDate: req.body.cancellationDate,
    cancellationReason: req.body.cancellationReason,
    premium: req.body.premium,
    coverage: req.body.coverage,
    notes: req.body.notes,
  };

  const attachmentPayload = { files: req.files };

  const data = await insuranceService.createInsurance(insurancePayload, attachmentPayload);

  res.status(201).json(data);
});

// @desc    Update insurance
// @route   PATCH /api/v1/insurance/:id
// @access  Private
exports.updateInsurance = asyncHandler(async (req, res) => {
  const payload = {
    id: req.params.id,
    company: req.body.company,
    fleet: req.body.fleet,
    policyNumber: req.body.policyNumber,
    provider: req.body.provider,
    status: req.body.status,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    cancellationDate: req.body.cancellationDate,
    cancellationReason: req.body.cancellationReason,
    premium: req.body.premium,
    coverage: req.body.coverage,
    notes: req.body.notes,
  };

  const data = await insuranceService.updateInsurance(payload);

  res.status(200).json(data);
});

// @desc    Delete insurance
// @route   DELETE /api/v1/insurance/:id
// @access  Private
exports.deleteInsurance = asyncHandler(async (req, res) => {
  const data = await insuranceService.deleteInsurance(req.params.id);

  res.status(200).json(data);
});
