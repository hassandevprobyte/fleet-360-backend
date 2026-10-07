const asyncHandler = require("express-async-handler");

// Services
const maintenanceService = require("./maintenance.service");

// @desc    Get all maintenance
// @route   GET /api/v1/maintenance/all
// @access  Private
exports.getAllMaintenance = asyncHandler(async (req, res) => {
  const data = await maintenanceService.getAllMaintenance(req.filters);

  res.status(200).json(data);
});

// @desc    Get maintenance with pagination
// @route   GET /api/v1/maintenance
// @access  Private
exports.getMaintenanceWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await maintenanceService.getMaintenanceWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get maintenance by id
// @route   GET /api/v1/maintenance/:id
// @access  Private
exports.getMaintenanceById = asyncHandler(async (req, res) => {
  const data = await maintenanceService.getMaintenanceById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new maintenance
// @route   POST /api/v1/maintenance
// @access  Private
exports.createMaintenance = asyncHandler(async (req, res) => {
  const maintenancePayload = {
    fleet: req.body.fleet,
    type: req.body.type,
    status: req.body.status,
    priority: req.body.priority,
    vendor: req.body.vendor,
    status: req.body.status,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    odometer: req.body.odometer,
    cost: req.body.cost,
    checklist: req.body.checklist,
    notes: req.body.notes,
    // createdBy: req.user._id,
  };

  const attachmentPayload = {
    conditionBefore: req.files?.conditionBefore,
    conditionAfter: req.files?.conditionAfter,
    // uploadedBy: req.user._id
  };

  const data = await maintenanceService.createMaintenance(maintenancePayload, attachmentPayload);

  res.status(201).json(data);
});

// @desc    Update maintenance
// @route   PATCH /api/v1/maintenance/:id
// @access  Private
exports.updateMaintenance = asyncHandler(async (req, res) => {
  const maintenancePayload = {
    id: req.params.id,
    fleet: req.body.fleet,
    type: req.body.type,
    status: req.body.status,
    priority: req.body.priority,
    vendor: req.body.vendor,
    status: req.body.status,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    odometer: req.body.odometer,
    cost: req.body.cost,
    checklist: req.body.checklist,
    notes: req.body.notes,
  };

  const attachmentPayload = {
    conditionBefore: req.files?.conditionBefore,
    conditionAfter: req.files?.conditionAfter,
    // uploadedBy: req.user._id
  };

  const data = await maintenanceService.updateMaintenance(maintenancePayload, attachmentPayload);

  res.status(200).json(data);
});

// @desc    Delete maintenance
// @route   DELETE /api/v1/maintenance/:id
// @access  Private
exports.deleteMaintenance = asyncHandler(async (req, res) => {
  const data = await maintenanceService.deleteMaintenance(req.params.id);

  res.status(200).json(data);
});
