const Company = require("./company.model");

exports.getAllCompanies = async (filters) => {
  return Company.find(filters).sort({ title: 1 }).lean();
};

exports.getCompaniesWithPagination = async (filters, offset, pageSize, sort) => {
  return Company.find(filters).skip(offset).limit(pageSize).sort({ title: 1 }).lean();
};

exports.getCompaniesCount = async (filters) => {
  return Company.countDocuments(filters);
};

exports.getCompanyById = async (companyId) => {
  return Company.findById(companyId);
};

exports.getCompanyByTitle = async (title) => {
  return Company.findOne({ title });
};

exports.getCompanyByAcronym = async (acronym) => {
  return Company.findOne({ acronym });
};

exports.getCompaniesByIds = async (companyIds) => {
  return Company.find({ _id: { $in: companyIds } });
};

exports.createCompany = async (payload) => {
  return Company.create(payload);
};

exports.updateCompanyById = async (companyId, payload) => {
  return Company.findByIdAndUpdate(companyId, payload, { returnDocument: "after" });
};

exports.deleteCompanyById = async (companyId) => {
  return Company.findByIdAndDelete(companyId);
};
