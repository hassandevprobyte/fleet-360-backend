const asyncHandler = require("express-async-handler");

// Services
const companyService = require("./company.service");

// Scope
const companyScope = require("./company.scope");

// @desc    Get all companies
// @route   GET /api/v1/companies/all
// @access  Private
exports.getAllCompanies = asyncHandler(async (req, res) => {
  const filters = req.filters;

  const data = await companyService.getAllCompanies(filters);

  res.status(200).json(data);
});

// @desc    Get companies with pagination
// @route   GET /api/v1/companies
// @access  Private
exports.getCompaniesWithPagination = asyncHandler(async (req, res) => {
  const payload = {
    filters: req.filters,
    page: req.pagination.page,
    pageSize: req.pagination.pageSize,
    sort: req.pagination.sort,
  };

  const data = await companyService.getCompaniesWithPagination(payload);

  res.status(200).json(data);
});

// @desc    Get company by id
// @route   GET /api/v1/companies/:id
// @access  Private
exports.getCompanyById = asyncHandler(async (req, res) => {
  await companyScope.authorizeByScope(req.user, req.params.id);

  const data = await companyService.getCompanyById(req.params.id);

  res.status(200).json(data);
});

// @desc    Create a new company
// @route   POST /api/v1/companies
// @access  Private
exports.createCompany = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    acronym: req.body.acronym,
    imgUrl: req.file?.path,
    website: req.body.website,
    phone: req.body.phone,
    address: req.body.address,
  };

  const data = await companyService.createCompany(payload);

  res.status(201).json(data);
});

// @desc    Update company
// @route   PATCH /api/v1/companies/:id
// @access  Private
exports.updateCompany = asyncHandler(async (req, res) => {
  await companyScope.authorizeByScope(req.user, req.params.id);

  const payload = {
    id: req.params.id,
    title: req.body.title,
    acronym: req.body.acronym,
    website: req.body.website,
    phone: req.body.phone,
    address: req.body.address,
    ...(req.file && { imgUrl: req.file.path }),
  };

  const data = await companyService.updateCompany(payload);

  res.status(200).json(data);
});

// @desc    Delete company
// @route   DELETE /api/v1/companies/:id
// @access  Private
exports.deleteCompany = asyncHandler(async (req, res) => {
  await companyScope.authorizeByScope(req.user, req.params.id);

  const data = await companyService.deleteCompany(req.params.id);

  res.status(200).json(data);
});
