const asyncHandler = require("express-async-handler");

// Services
const picklistService = require("./picklist.service");

// @desc    Get all picklists
// @route   GET /api/v1/picklists/all
// @access  Private
exports.getAllPicklists = asyncHandler(async (req, res) => {
  const filters = req.filters;

  const data = await picklistService.getAllPicklists(filters);

  res.status(200).json(data);
});

// @desc    Get picklist categories
// @route   GET /api/v1/picklists/category
// @access  Private
exports.getPicklistCategories = asyncHandler(async (req, res) => {
  const data = await picklistService.getPicklistCategories();

  res.status(200).json(data);
});

// @desc    Get picklists with pagination
// @route   GET /api/v1/picklists
// @access  Private
exports.getPicklistsWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await picklistService.getPicklistsWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get picklist by id
// @route   GET /api/v1/picklists/:id
// @access  Private
exports.getPicklistById = asyncHandler(async (req, res) => {
  const data = await picklistService.getPicklistById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new picklist
// @route   POST /api/v1/picklists
// @access  Private
exports.createPicklist = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    acronym: req.body.acronym,
    preserveTitleFormatting: req.body.preserveTitleFormatting,
    scope: req.body.scope,
    resource: req.body.resource,
    field: req.body.field,
    parentPicklist: req.body.parentPicklist,
    color: req.body.color,
    order: req.body.order,
    isDefault: req.body.isDefault,
    isActive: req.body.isActive,
    meta: req.body.meta,
  };

  const data = await picklistService.createPicklist(payload);

  res.status(201).json(data);
});

// @desc    Update picklist
// @route   PATCH /api/v1/picklists/:id
// @access  Private
exports.updatePicklist = asyncHandler(async (req, res) => {
  const payload = {
    id: req.params.id,
    title: req.body.title,
    acronym: req.body.acronym,
    preserveTitleFormatting: req.body.preserveTitleFormatting,
    scope: req.body.scope,
    resource: req.body.resource,
    field: req.body.field,
    parentPicklist: req.body.parentPicklist,
    color: req.body.color,
    order: req.body.order,
    isDefault: req.body.isDefault,
    isActive: req.body.isActive,
    meta: req.body.meta,
  };

  const data = await picklistService.updatePicklist(payload);

  res.status(200).json(data);
});

// @desc    Delete picklist
// @route   DELETE /api/v1/picklists/:id
// @access  Private
exports.deletePicklist = asyncHandler(async (req, res) => {
  const data = await picklistService.deletePicklist(req.params.id);

  res.status(200).json(data);
});
