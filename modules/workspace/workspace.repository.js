const Workspace = require("./workspace.model");

const POPULATION_PIPELINE = [{ path: "user" }, { path: "members.user" }];

exports.getAllWorkspaces = async (filters) => {
  return Workspace.find(filters).sort({ createdAt: -1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getWorkspacesWithPagination = async (filters, offset, pageSize, sort) => {
  return Workspace.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getWorkspacesCount = async (filters) => {
  return Workspace.countDocuments(filters);
};

exports.getWorkspaceById = async (workspaceId) => {
  return Workspace.findById(workspaceId).populate(POPULATION_PIPELINE).lean();
};

exports.getWorkspacesByIds = async (workspaceIds) => {
  return Workspace.find({ _id: { $in: workspaceIds } })
    .populate(POPULATION_PIPELINE)
    .lean();
};

exports.getWorkspaceByUserId = async (userId) => {
  return Workspace.findOne({ user: userId }).populate(POPULATION_PIPELINE).lean();
};

exports.getWorkspaceBySlug = async (slug) => {
  return Workspace.findOne({ slug }).populate(POPULATION_PIPELINE).lean();
};

exports.createWorkspace = async (payload) => {
  return Workspace.create(payload);
};

exports.updateWorkspaceById = async (workspaceId, payload) => {
  return Workspace.findByIdAndUpdate(workspaceId, payload, { returnDocument: "after" });
};

exports.deleteWorkspaceById = async (workspaceId) => {
  return Workspace.findByIdAndDelete(workspaceId);
};
