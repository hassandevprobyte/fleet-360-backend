const Boom = require("@hapi/boom");

// Repositories
const companyRepository = require("./company.repository");
const userRepository = require("../user/user.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfCompanyDoesNotExist = async (companyId) => {
  const company = await companyRepository.getCompanyById(companyId);

  if (!company) {
    throw Boom.notFound(message.error.company.notFound);
  }

  return company;
};

exports.throwErrorIfAnyCompanyDoesNotExist = async (companyIds) => {
  const companies = await companyRepository.getCompaniesByIds(companyIds);

  if (companies.length !== companyIds.length) {
    throw Boom.notFound(message.error.company.notFound);
  }

  return companies;
};

exports.throwErrorIfCompanyTitleExists = async (title) => {
  const titleExists = await companyRepository.getCompanyByTitle(title);

  if (titleExists) {
    throw Boom.conflict(message.error.company.titleExists);
  }
};

exports.throwErrorIfCompanyAcronymExists = async (acronym) => {
  const acronymExists = await companyRepository.getCompanyByAcronym(acronym);

  if (acronymExists) {
    throw Boom.conflict(message.error.company.acronymExists);
  }
};

exports.throwErrorIfCompanyIsAssignedOnUser = async (companyId) => {
  const companyIsAssigned = await userRepository.getUserByCompanyId(companyId);

  if (companyIsAssigned) {
    throw Boom.conflict(message.error.company.assignedOnUser);
  }
};
