const Depreciation = require("./depreciation.model");

const POPULATION_PIPELINE = [{ path: "fleet" }];

exports.getAllDepreciations = async (filters) => {
  return Depreciation.find(filters).populate(POPULATION_PIPELINE).lean();
};

exports.getDepreciationsWithPagination = async (filters, offset, pageSize, sort) => {
  return Depreciation.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getDepreciationsCount = async (filters) => {
  return Depreciation.countDocuments(filters);
};

exports.getDepreciationById = async (depreciationId) => {
  return Depreciation.findById(depreciationId).populate(POPULATION_PIPELINE).lean();
};

exports.getDepreciationByFleetId = async (fleetId) => {
  return Depreciation.findOne({ fleet: fleetId }).populate(POPULATION_PIPELINE).lean();
};

exports.createDepreciation = async (payload) => {
  return Depreciation.create(payload);
};

exports.updateDepreciationById = async (depreciationId, payload) => {
  return Depreciation.findByIdAndUpdate(depreciationId, payload, { returnDocument: "after" });
};

exports.deleteDepreciationById = async (depreciationId) => {
  return Depreciation.findByIdAndDelete(depreciationId);
};
