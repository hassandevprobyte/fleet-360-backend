const asyncHandler = require("express-async-handler");

// Services
const fleetService = require("./fleet.service");

// @desc    Get all fleets
// @route   GET /api/v1/fleets/all
// @access  Private
exports.getAllFleets = asyncHandler(async (req, res) => {
  const data = await fleetService.getAllFleets(req.filters);

  res.status(200).json(data);
});

// @desc    Get fleets with pagination
// @route   GET /api/v1/fleets
// @access  Private
exports.getFleetsWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await fleetService.getFleetsWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get Fleet by id
// @route   GET /api/v1/fleets/:id
// @access  Private
exports.getFleetById = asyncHandler(async (req, res) => {
  const data = await fleetService.getFleetById(req.params.id);

  res.status(200).json(data);
});

// @desc    Get fleets summary by group
// @route   GET /api/v1/fleets/summary/byGroup
// @access  Private
exports.getFleetsSummaryByGroup = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    primaryGroup: req.query.primaryGroup,
    secondaryGroup: req.query.secondaryGroup,
  };

  const data = await fleetService.getFleetsSummaryByGroup(payload);

  res.status(200).json(data);
});

// @desc    Create a new Fleet
// @route   POST /api/v1/fleets
// @access  Private
exports.createFleet = asyncHandler(async (req, res) => {
  const vehiclePayload = {
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    type: req.body.type,
    fuelType: req.body.fuelType,
    transmission: req.body.transmission,
    color: req.body.color,
    licensePlate: req.body.licensePlate,
    purchaseAmount: req.body.purchaseAmount,
    purchaseDate: req.body.purchaseDate,
    rent: req.body.rent,
    initialOdometer: req.body.initialOdometer,
    status: req.body.status,
    condition: req.body.condition,
    company: req.body.company,
    assignedTo: req.body.assignedTo,
    // assignedBy: req.user._id,
    assignedOn: req.body.assignedOn,
    inspector: req.body.inspector,
    // createdBy: req.user._id,
  };

  const attachmentPayload = {
    documents: req.files.documents,
    images: req.files.images,
    // uploadedBy: req.user._id,
  };

  const data = await fleetService.createFleet(vehiclePayload, attachmentPayload);

  res.status(201).json(data);
});

// @desc    Update Fleet
// @route   PATCH /api/v1/fleets/:id
// @access  Private
exports.updateFleet = asyncHandler(async (req, res) => {
  const payload = {
    id: req.params.id,
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    type: req.body.type,
    fuelType: req.body.fuelType,
    transmission: req.body.transmission,
    color: req.body.color,
    licensePlate: req.body.licensePlate,
    purchaseAmount: req.body.purchaseAmount,
    purchaseDate: req.body.purchaseDate,
    rent: req.body.rent,
    initialOdometer: req.body.initialOdometer,
    status: req.body.status,
    condition: req.body.condition,
    company: req.body.company,
    assignedTo: req.body.assignedTo,
    // assignedBy: req.user._id,
    assignedOn: req.body.assignedOn,
    inspector: req.body.inspector,
  };

  const attachmentPayload = {
    documents: req.files.documents,
    images: req.files.images,
    // uploadedBy: req.user._id,
  };

  const data = await fleetService.updateFleet(payload, attachmentPayload);

  res.status(200).json(data);
});

// @desc    Delete Fleet
// @route   DELETE /api/v1/fleets/:id
// @access  Private
exports.deleteFleet = asyncHandler(async (req, res) => {
  const data = await fleetService.deleteFleet(req.params.id);

  res.status(200).json(data);
});
