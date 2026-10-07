const Access = require("./access.model");

const POPULATION_PIPELINE = [{ path: "roles" }];

exports.getAllAccess = async (filters) => {
  return Access.find(filters).populate(POPULATION_PIPELINE).lean();
};

exports.getAccessWithPagination = async (filters, offset, pageSize, sort) => {
  return Access.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getAccessCount = async (filters) => {
  return Access.countDocuments(filters);
};

exports.getAccessById = async (accessId) => {
  return Access.findById(accessId).populate(POPULATION_PIPELINE).lean();
};

exports.getAccessByUserId = async (userId) => {
  return Access.findOne({ user: userId }).populate(POPULATION_PIPELINE).lean();
};

exports.createAccess = async (payload) => {
  return Access.create(payload);
};

exports.updateAccessById = async (accessId, payload) => {
  return Access.findByIdAndUpdate(accessId, payload);
};

exports.deleteAccessById = async (accessId) => {
  return Access.findByIdAndDelete(accessId);
};
