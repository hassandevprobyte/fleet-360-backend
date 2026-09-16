const User = require("./user.model");

const POPULATION_PIPELINE = [{ path: "companies" }, { path: "brands" }, { path: "roles" }];

exports.getAllUsers = async (filters) => {
  return User.find(filters, "-password").sort({ name: 1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getUsersWithPagination = async (filters, offset, pageSize, sort) => {
  return User.find(filters, "-password").skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getUsersCount = async (filters) => {
  return User.countDocuments(filters);
};

exports.getUserById = async (userId) => {
  return User.findById(userId, "-password").populate(POPULATION_PIPELINE).lean();
};

exports.getUserPasswordById = async (userId) => {
  const user = await User.findById(userId, "password");

  return user ? user.password : null;
};

exports.getUserByEmail = async (email) => {
  return User.findOne({ email });
};

exports.getUserByBrandId = async (brandId) => {
  return User.findOne({ brands: brandId });
};

exports.getUserByCompanyId = async (companyId) => {
  return User.findOne({ companies: companyId });
};

exports.getUserBySmtpId = async (smtpId) => {
  return User.findOne({ smtps: smtpId });
};

exports.getUserByRoleId = async (roleId) => {
  return User.findOne({ roles: roleId });
};

exports.getUserByIdAndBrandId = async (userId, brandId) => {
  return User.findOne({ _id: userId, brands: brandId });
};

exports.getUserByIdAndCompanyId = async (userId, companyId) => {
  return User.findOne({ _id: userId, companies: companyId });
};

exports.getUsersByIds = async (userIds) => {
  return User.find({ _id: { $in: userIds } });
};

exports.getUsersByIdsAndBrandId = async (userIds, brandId) => {
  return User.find({ _id: { $in: userIds }, brands: brandId });
};

exports.getUsersByIdsAndCompanyId = async (userIds, companyId) => {
  return User.find({ _id: { $in: userIds }, companies: companyId });
};

exports.createUser = async (payload) => {
  return User.create(payload);
};

exports.updateUserById = async (userId, payload) => {
  return User.findByIdAndUpdate(userId, payload, { returnDocument: "after" });
};

exports.deleteUserById = async (userId) => {
  return User.findByIdAndDelete(userId);
};
