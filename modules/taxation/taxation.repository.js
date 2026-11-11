const Taxation = require("./taxation.model");

const POPULATION_PIPELINE = [{ path: "workspace" }, { path: "vehicle" }, { path: "jurisdiction" }, { path: "createdBy" }, { path: "documents" }];

exports.getAllTaxation = async (filters) => {
  return Taxation.find(filters).sort({ createdAt: -1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getTaxationWithPagination = async (filters, offset, pageSize, sort) => {
  return Taxation.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getTaxationCount = async (filters) => {
  return Taxation.countDocuments(filters);
};

exports.getTaxationById = async (taxationId) => {
  return Taxation.findById(taxationId).populate(POPULATION_PIPELINE).lean();
};

exports.getTaxationByVehicleId = async (vehicleId) => {
  return Taxation.findOne({ vehicle: vehicleId }).populate(POPULATION_PIPELINE).lean();
};

exports.createTaxation = async (payload) => {
  return Taxation.create(payload);
};

exports.updateTaxationById = async (taxationId, payload) => {
  return Taxation.findByIdAndUpdate(taxationId, payload, { returnDocument: "after" });
};

exports.deleteTaxationById = async (taxationId) => {
  return Taxation.findByIdAndDelete(taxationId);
};
