const Role = require("./role.model");

exports.getAllRoles = async (filters) => {
  return Role.find(filters).sort({ title: 1 }).lean();
};

exports.getRolesWithPagination = async (filters, offset, pageSize, sort) => {
  return Role.find(filters).skip(offset).limit(pageSize).sort(sort).lean();
};

exports.getRolesCount = async (filters) => {
  return Role.countDocuments(filters);
};

exports.getRoleById = async (roleId) => {
  return Role.findById(roleId);
};

exports.getRoleByTitle = async (title) => {
  return Role.findOne({ title });
};

exports.getRolesByIds = async (roleIds) => {
  return Role.find({ _id: { $in: roleIds } });
};

exports.createRole = async (payload) => {
  return Role.create(payload);
};

exports.updateRoleById = async (roleId, payload) => {
  return Role.findByIdAndUpdate(roleId, payload, { returnDocument: "after" });
};

exports.deleteRoleById = async (roleId) => {
  return Role.findByIdAndDelete(roleId);
};
