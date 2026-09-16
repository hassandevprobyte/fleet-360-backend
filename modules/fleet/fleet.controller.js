const asyncHandler = require("express-async-handler");

// Services
const fleetService = require("./fleet.service");

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

  const data = await fleetService.getVehiclesWithPagination(payload);

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

  const data = await fleetService.getVehiclesSummaryByGroup(payload);

  res.status(200).json(data);
});

// @desc    Get Fleet by id
// @route   GET /api/v1/fleets/:id
// @access  Private
exports.getFleetById = asyncHandler(async (req, res) => {
  const data = await fleetService.getVehicleById(req.params.id);

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
    color: req.body.color,
    licensePlate: req.body.licensePlate,
    purchaseAmount: req.body.purchaseAmount,
    purchaseDate: req.body.purchaseDate,
    rent: req.body.rent,
    initialOdometer: req.body.initialOdometer,
    status: req.body.status,
    company: req.body.company,
    assignedTo: req.body.assignedTo,
    assignedOn: req.body.assignedOn,
    assignedBy: req.user._id,
    inspector: req.body.inspector,
    createdBy: req.user._id,
  };

  const attachmentPayload = { files: req.files, uploadedBy: req.user._id };

  const data = await fleetService.createVehicle(vehiclePayload, attachmentPayload);

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
    color: req.body.color,
    licensePlate: req.body.licensePlate,
    purchaseAmount: req.body.purchaseAmount,
    purchaseDate: req.body.purchaseDate,
    rent: req.body.rent,
    initialOdometer: req.body.initialOdometer,
    status: req.body.status,
    company: req.body.company,
    assignedTo: req.body.assignedTo,
    assignedOn: req.body.assignedOn,
    assignedBy: req.user._id,
    inspector: req.body.inspector,
  };

  const data = await fleetService.updateVehicle(payload);

  res.status(200).json(data);
});

// @desc    Delete Fleet
// @route   DELETE /api/v1/fleets/:id
// @access  Private
exports.deleteFleet = asyncHandler(async (req, res) => {
  const data = await fleetService.deleteVehicle(req.params.id);

  res.status(200).json(data);
});
