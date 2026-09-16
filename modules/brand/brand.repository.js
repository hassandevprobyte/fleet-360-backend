const Brand = require("./brand.model");

const POPULATION_PIPELINE = [{ path: "company" }];

exports.getAllBrands = async (filters) => {
  return Brand.find(filters).sort({ title: 1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getBrandsWithPagination = async (filters, offset, pageSize, sort) => {
  return Brand.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getBrandsCount = async (filters) => {
  return Brand.countDocuments(filters);
};

exports.getBrandById = async (brandId) => {
  return Brand.findById(brandId);
};

exports.getBrandByIdAndCompanyId = async (brandId, companyId) => {
  return Brand.findOne({ _id: brandId, company: companyId });
};

exports.getBrandByTitleAndCompanyId = async (title, companyId) => {
  return Brand.findOne({ title, company: companyId });
};

exports.getBrandByAcronymAndCompanyId = async (acronym, companyId) => {
  return Brand.findOne({ acronym, company: companyId });
};

exports.getBrandsByIds = async (brandIds) => {
  return Brand.find({ _id: { $in: brandIds } });
};

exports.getBrandsByIdsAndCompanyId = async (brandIds, companyId) => {
  return Brand.find({ _id: { $in: brandIds }, company: companyId });
};

exports.getBrandsByIdsAndCompanyIds = async (brandIds, companyIds) => {
  return Brand.find({ _id: { $in: brandIds }, company: { $in: companyIds } });
};

exports.createBrand = async (payload) => {
  return Brand.create(payload);
};

exports.updateBrandById = async (brandId, payload) => {
  return Brand.findByIdAndUpdate(brandId, payload, { returnDocument: "after" });
};

exports.deleteBrandById = async (brandId) => {
  return Brand.findByIdAndDelete(brandId);
};
