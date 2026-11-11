const Maintenance = require("./maintenance.model");

const POPULATION_PIPELINE = [
  { path: "workspace" },
  { path: "vehicle" },
  { path: "type" },
  { path: "status" },
  { path: "priority" },
  { path: "vendor" },
  { path: "checklist", populate: { path: "item" } },
  { path: "checklist", populate: { path: "condition" } },
  { path: "createdBy" },
  { path: "beforeImages" },
  { path: "afterImages" },
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

exports.getMaintenanceByVehicleId = async (vehicleId) => {
  return Maintenance.findOne({ vehicle: vehicleId }).populate(POPULATION_PIPELINE).lean();
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

exports.deleteMaintenanceByVehicleId = async (vehicleId) => {
  return Maintenance.findOneAndDelete({ vehicle: vehicleId });
};
