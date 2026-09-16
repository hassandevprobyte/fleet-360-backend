const _ = require("lodash");

// Repositories
const companyRepository = require("./company.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./company.schema");
const companyValidation = require("./company.validation");

exports.getAllCompanies = async (filters) => {
  return companyRepository.getAllCompanies(filters);
};

exports.getCompaniesWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [companies, totalCount] = await Promise.all([companyRepository.getCompaniesWithPagination(filters, offset, pageSize, sort), companyRepository.getCompaniesCount(filters)]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: companies, meta };
};

exports.getCompanyById = async (companyId) => {
  joi.validate(companyId, joiSchema.getCompanyById);

  return companyValidation.throwErrorIfCompanyDoesNotExist(companyId);
};

exports.createCompany = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createCompany);

  await companyValidation.throwErrorIfCompanyTitleExists(validatedPayload.title);
  await companyValidation.throwErrorIfCompanyAcronymExists(validatedPayload.acronym);

  return companyRepository.createCompany(validatedPayload);
};

exports.updateCompany = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateCompany);

  const existingCompany = await companyValidation.throwErrorIfCompanyDoesNotExist(validatedPayload.id);
  const updatePayload = {};

  if (validatedPayload.title && validatedPayload.title !== existingCompany.title) {
    await companyValidation.throwErrorIfCompanyTitleExists(validatedPayload.title);
    updatePayload.title = validatedPayload.title;
  }

  if (validatedPayload.acronym && validatedPayload.acronym !== existingCompany.acronym) {
    await companyValidation.throwErrorIfCompanyAcronymExists(validatedPayload.acronym);
    updatePayload.acronym = validatedPayload.acronym;
  }

  if (validatedPayload.website && validatedPayload.website !== existingCompany.website) {
    updatePayload.website = validatedPayload.website;
  }

  if (validatedPayload.phone && validatedPayload.phone !== existingCompany.phone) {
    updatePayload.phone = validatedPayload.phone;
  }

  if (validatedPayload.address && !_.isEqual(validatedPayload.address, existingCompany.address?.toObject?.() ?? existingCompany.address)) {
    updatePayload.address = validatedPayload.address;
  }

  if (!Object.keys(updatePayload).length) return existingCompany;

  return companyRepository.updateCompanyById(validatedPayload.id, updatePayload);
};

exports.deleteCompany = async (companyId) => {
  joi.validate(companyId, joiSchema.getCompanyById);

  await Promise.all([companyValidation.throwErrorIfCompanyDoesNotExist(companyId), companyValidation.throwErrorIfCompanyIsAssignedOnUser(companyId)]);

  await companyRepository.deleteCompanyById(companyId);

  return { deletedId: companyId };
};
