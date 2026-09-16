const Boom = require("@hapi/boom");

// Repositories
const brandRepository = require("./brand.repository");
const userRepository = require("../user/user.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfBrandDoesNotExist = async (brandId) => {
  const brand = await brandRepository.getBrandById(brandId);

  if (!brand) {
    throw Boom.notFound(message.error.brand.notFound);
  }

  return brand;
};

exports.throwErrorIfAnyBrandDoesNotExist = async (brandIds) => {
  const brands = await brandRepository.getBrandsByIds(brandIds);

  if (brands.length !== brandIds.length) {
    throw Boom.notFound(message.error.brand.notFound);
  }
  console.log("foo");

  return brands;
};

exports.throwErrorIfBrandDoesNotExistInCompany = async (brandId, companyId) => {
  const brand = await brandRepository.getBrandByIdAndCompanyId(brandId, companyId);

  if (!brand) {
    throw Boom.notFound(message.error.brand.notFoundInCompany);
  }

  return brand;
};

exports.throwErrorIfAnyBrandDoesNotExistInCompany = async (brandIds, companyId) => {
  const brands = await brandRepository.getBrandsByIdsAndCompanyId(brandIds, companyId);

  if (brands.length !== brandIds.length) {
    throw Boom.notFound(message.error.brand.notFoundInCompany);
  }

  return brands;
};

exports.throwErrorIfAnyBrandDoesNotExistInAnyCompany = async (brandIds, companyIds) => {
  const brands = await brandRepository.getBrandsByIdsAndCompanyIds(brandIds, companyIds);

  if (brands.length !== brandIds.length) {
    throw Boom.notFound(message.error.brand.notFoundInCompany);
  }

  return brands;
};

exports.throwErrorIfBrandTitleExistsInCompany = async (title, companyId) => {
  const titleExists = await brandRepository.getBrandByTitleAndCompanyId(title, companyId);

  if (titleExists) {
    throw Boom.conflict(message.error.brand.titleExists);
  }
};

exports.throwErrorIfBrandAcronymExistsInCompany = async (acronym, companyId) => {
  const acronymExists = await brandRepository.getBrandByAcronymAndCompanyId(acronym, companyId);

  if (acronymExists) {
    throw Boom.conflict(message.error.brand.acronymExists);
  }
};

exports.throwErrorIfBrandIsAssignedOnUser = async (brandId) => {
  const brandIsAssigned = await userRepository.getUserByBrandId(brandId);

  if (brandIsAssigned) {
    throw Boom.conflict(message.error.brand.assignedOnUser);
  }
};
