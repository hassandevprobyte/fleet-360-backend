const asyncHandler = require("express-async-handler");

// Services
const vehicleService = require("./vehicle.service");

// @desc    Get all vehicles
// @route   GET /api/v1/vehicles/all
// @access  Private
exports.getAllVehicles = asyncHandler(async (req, res) => {
  const data = await vehicleService.getAllVehicles(req.filters);

  res.status(200).json(data);
});

// @desc    Get vehicles with pagination
// @route   GET /api/v1/vehicles
// @access  Private
exports.getVehiclesWithPagination = asyncHandler(async (req, res) => {
  console.log(req.filters);
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await vehicleService.getVehiclesWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get Vehicle by id
// @route   GET /api/v1/vehicles/:id
// @access  Private
exports.getVehicleById = asyncHandler(async (req, res) => {
  const data = await vehicleService.getVehicleById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new Vehicle
// @route   POST /api/v1/vehicles
// @access  Private
exports.createVehicle = asyncHandler(async (req, res) => {
  const vehiclePayload = {
    workspace: req.context?.workspaceId,
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
    driverDetails: req.body.driverDetails,
    // assignedBy: req.context?.user._id,
    assignedOn: req.body.assignedOn,
    inspector: req.body.inspector,
    createdBy: req.context?.user._id,
  };

  const attachmentPayload = {
    documents: req.files?.documents,
    images: req.files?.images,
    uploadedBy: req.context?.user?._id,
  };

  const data = await vehicleService.createVehicle(vehiclePayload, attachmentPayload);

  res.status(201).json(data);
});

// @desc    Update Vehicle
// @route   PATCH /api/v1/vehicles/:id
// @access  Private
exports.updateVehicle = asyncHandler(async (req, res) => {
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
    driverDetails: req.body.driverDetails,
    // assignedBy: req.context?.user._id,
    assignedOn: req.body.assignedOn,
    inspector: req.body.inspector,
    removedDocuments: req.body.removedDocuments,
    removedImages: req.body.removedImages,
  };

  const attachmentPayload = {
    documents: req.files?.documents,
    images: req.files?.images,
    uploadedBy: req.context?.user?._id,
  };

  const data = await vehicleService.updateVehicle(payload, attachmentPayload);

  res.status(200).json(data);
});

// @desc    Delete Vehicle
// @route   DELETE /api/v1/vehicles/:id
// @access  Private
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const data = await vehicleService.deleteVehicle(req.params.id);

  res.status(200).json(data);
});

// @desc    Export Vehicle
// @route   GET /api/v1/vehicles/export
// @access  Private
exports.exportVehicles = asyncHandler(async (req, res) => {
  const filters = req.filters;

  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=vehicles_${Date.now()}.xlsx`);

  await vehicleService.exportVehicles(filters, res);
});
