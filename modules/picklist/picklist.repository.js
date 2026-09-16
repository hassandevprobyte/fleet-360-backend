const Picklist = require("./picklist.model");

// Constants
const { SCOPE } = require("../../constants/PICKLIST");

const POPULATION_PIPELINE = [{ path: "parentPicklist" }];

exports.getAllPicklists = async (filters) => {
  return Picklist.find(filters).sort({ order: 1, title: 1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getPicklistsWithPagination = async (filters, offset, pageSize, sort) => {
  return Picklist.find(filters).skip(offset).limit(pageSize).sort({ order: 1, title: 1 }).lean();
};

exports.getPicklistsCount = async (filters) => {
  return Picklist.countDocuments(filters);
};

exports.getPicklistById = async (picklistId) => {
  return Picklist.findById(picklistId).populate(POPULATION_PIPELINE).lean();
};

exports.getPicklistByParentPicklistId = async (parentPicklistId) => {
  return Picklist.findOne({ parentPicklist: parentPicklistId });
};

exports.getPicklistByIdAndParentPicklistId = async (picklistId, parentPicklistId) => {
  return Picklist.findOne({ _id: picklistId, parentPicklist: parentPicklistId });
};

exports.getPicklistByIdAndContext = async (picklistId, scope, resource, field, parentPicklist = null) => {
  const filters = { _id: picklistId, scope, resource, parentPicklist, ...(field && { field }) };

  return Picklist.findOne(filters);
};

exports.getPicklistByValueInContext = (value, scope, resource, field, parentPicklist = null) => {
  return Picklist.findOne({ value, scope, resource, field, parentPicklist });
};

exports.getPicklistByAcronymInContext = (acronym, scope, resource, field, parentPicklist = null) => {
  return Picklist.findOne({ acronym, scope, resource, field, parentPicklist });
};

exports.getDefaultPicklistInContext = (scope = SCOPE.RESOURCE, resource, field, parentPicklist = null) => {
  return Picklist.findOne({ scope, resource, field, parentPicklist, isDefault: true });
};

exports.getPicklistsByIds = async (picklistIds) => {
  return Picklist.find({ _id: { $in: picklistIds } });
};

exports.createPicklist = async (payload) => {
  return Picklist.create(payload);
};

exports.updatePicklistById = async (picklistId, payload) => {
  return Picklist.findByIdAndUpdate(picklistId, payload, { returnDocument: "after" });
};

exports.clearDefaultsInContext = async (scope, resource, field, parentPicklist = null) => {
  return Picklist.updateMany({ scope, resource, field, parentPicklist, isDefault: true }, { $set: { isDefault: false } });
};

exports.deletePicklistById = async (picklistId) => {
  return Picklist.findByIdAndDelete(picklistId);
};
