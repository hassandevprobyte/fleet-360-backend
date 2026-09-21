const Insurance = require("./insurance.model");

const POPULATION_PIPELINE = [{ path: "fleet" }];

exports.getAllInsurance = async (filters) => {
  return Insurance.find(filters).sort({ createdAt: -1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getInsuranceWithPagination = async (filters, offset, pageSize, sort) => {
  return Insurance.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getInsuranceCount = async (filters) => {
  return Insurance.countDocuments(filters);
};

exports.getInsuranceById = async (insuranceId) => {
  return Insurance.findById(insuranceId).populate(POPULATION_PIPELINE).lean();
};

exports.getInsuranceByFleetId = async (fleetId) => {
  return Insurance.findOne({ fleet: fleetId }).populate(POPULATION_PIPELINE).lean();
};

exports.createInsurance = async (payload) => {
  return Insurance.create(payload);
};

exports.updateInsuranceById = async (insuranceId, payload) => {
  return Insurance.findByIdAndUpdate(insuranceId, payload, { returnDocument: "after" });
};

exports.deleteInsuranceById = async (insuranceId) => {
  return Insurance.findByIdAndDelete(insuranceId);
};
