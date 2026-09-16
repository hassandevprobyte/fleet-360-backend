// Repositories
const brandRepository = require("./brand.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./brand.schema");
const brandValidation = require("./brand.validation");
const companyValidation = require("../company/company.validation");

exports.getAllBrands = async (filters) => {
  return brandRepository.getAllBrands(filters);
};

exports.getBrandsWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [brands, totalCount] = await Promise.all([brandRepository.getBrandsWithPagination(filters, offset, pageSize, sort), brandRepository.getBrandsCount(filters)]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };
  return { data: brands, meta };
};

exports.getBrandById = async (brandId) => {
  joi.validate(brandId, joiSchema.getBrandById);

  return brandValidation.throwErrorIfBrandDoesNotExist(brandId);
};

exports.createBrand = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createBrand);

  await companyValidation.throwErrorIfCompanyDoesNotExist(validatedPayload.company);
  await brandValidation.throwErrorIfBrandTitleExistsInCompany(validatedPayload.title, validatedPayload.company);
  await brandValidation.throwErrorIfBrandAcronymExistsInCompany(validatedPayload.acronym, validatedPayload.company);

  return brandRepository.createBrand(validatedPayload);
};

exports.updateBrand = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateBrand);

  const existingBrand = await brandValidation.throwErrorIfBrandDoesNotExist(validatedPayload.id);
  const updatePayload = {};

  if (validatedPayload.title && existingBrand.title !== validatedPayload.title) {
    await brandValidation.throwErrorIfBrandTitleExistsInCompany(validatedPayload.title, existingBrand.company);
    updatePayload.title = validatedPayload.title;
  }

  if (validatedPayload.acronym && existingBrand.acronym !== validatedPayload.acronym) {
    await brandValidation.throwErrorIfBrandAcronymExistsInCompany(validatedPayload.acronym, existingBrand.company);
    updatePayload.acronym = validatedPayload.acronym;
  }

  if (!Object.keys(updatePayload).length) return existingBrand;

  return brandRepository.updateBrandById(validatedPayload.id, updatePayload);
};

exports.deleteBrand = async (brandId) => {
  joi.validate(brandId, joiSchema.getBrandById);

  await brandValidation.throwErrorIfBrandDoesNotExist(brandId);
  await brandValidation.throwErrorIfBrandIsAssignedOnUser(brandId);

  await brandRepository.deleteBrandById(brandId);
  return { deletedId: brandId };
};
