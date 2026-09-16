const asyncHandler = require("express-async-handler");

// Services
const brandService = require("./brand.service");

// Scope
const brandScope = require("./brand.scope");

// @desc    Get all brands
// @route   GET /api/v1/brands/all
// @access  Private
exports.getAllBrands = asyncHandler(async (req, res) => {
  const filters = req.filters;

  const data = await brandService.getAllBrands(filters);

  res.status(200).json(data);
});

// @desc    Get brands with pagination
// @route   GET /api/v1/brands
// @access  Private
exports.getBrandsWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await brandService.getBrandsWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get brand by id
// @route   GET /api/v1/brands/:id
// @access  Private
exports.getBrandById = asyncHandler(async (req, res) => {
  await brandScope.authorizeByScope(req.user, req.params.id);

  const data = await brandService.getBrandById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new brand
// @route   POST /api/v1/brands
// @access  Private
exports.createBrand = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    acronym: req.body.acronym,
    company: req.body.company,
    brandUrl: req.body.brandUrl,
    isActive: req.body.isActive,
    imgUrl: req.file?.path,
  };

  const data = await brandService.createBrand(payload);

  res.status(201).json(data);
});

// @desc    Update brand
// @route   PATCH /api/v1/brands/:id
// @access  Private
exports.updateBrand = asyncHandler(async (req, res) => {
  await brandScope.authorizeByScope(req.user, req.params.id);

  const payload = {
    id: req.params.id,
    title: req.body.title,
    acronym: req.body.acronym,
    brandUrl: req.body.brandUrl,
    isActive: req.body.isActive,
    ...(req.file && { imgUrl: req.file.path }),
  };

  const data = await brandService.updateBrand(payload);

  res.status(200).json(data);
});

// @desc    Delete brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteBrand = asyncHandler(async (req, res) => {
  await brandScope.authorizeByScope(req.user, req.params.id);

  const data = await brandService.deleteBrand(req.params.id);

  res.status(200).json(data);
});
