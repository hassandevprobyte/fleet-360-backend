const Maintenance = require("./maintenance.model");

const POPULATION_PIPELINE = [
  { path: "fleet" },
  { path: "type" },
  { path: "status" },
  { path: "priority" },
  { path: "provider" },
  { path: "checklist", populate: { path: "item" } },
  { path: "checklist", populate: { path: "status" } },
  { path: "checklist", populate: { path: "condition" } },
  { path: "components", populate: { path: "component" } },
];

exports.getAllMaintenance = async (filters) => {
  return Maintenance.find(filters).sort({ createdAt: -1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getMaintenanceWithPagination = async (filters, offset, pageSize, sort) => {
  return Maintenance.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getMaintenanceCount = async (filters) => {
  return Maintenance.countDocuments(filters);
};

exports.getMaintenanceById = async (maintenanceId) => {
  return Maintenance.findById(maintenanceId).populate(POPULATION_PIPELINE).lean();
};

exports.getMaintenanceByFleetId = async (fleetId) => {
  return Maintenance.findOne({ fleet: fleetId }).populate(POPULATION_PIPELINE).lean();
};

exports.createMaintenance = async (payload) => {
  return Maintenance.create(payload);
};

exports.updateMaintenanceById = async (maintenanceId, payload) => {
  return Maintenance.findByIdAndUpdate(maintenanceId, payload, { returnDocument: "after" });
};

exports.deleteMaintenanceById = async (maintenanceId) => {
  return Maintenance.findByIdAndDelete(maintenanceId);
};
