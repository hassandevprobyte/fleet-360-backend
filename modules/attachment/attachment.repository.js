const Attachment = require("./attachment.model");

// Utilities
const normalizeToArray = require("../../common/utils/normalizeToArray");

exports.getAttachmentById = async (attachmentId) => {
  return Attachment.findById(attachmentId).lean();
};

exports.getAttachmentsByResource = async (resource, resourceId) => {
  return Attachment.find({ resource, resourceId }).lean();
};

exports.getAttachmentsGroupedByResourceIds = async (resourceIds) => {
  const aggregationPipeline = [{ $match: { resourceId: { $in: resourceIds } } }, { $group: { _id: "$resourceId", attachments: { $push: "$$ROOT" } } }];

  return Attachment.aggregate(aggregationPipeline);
};

exports.getAttachmentsByIds = async (attachmentIds) => {
  return Attachment.find({ _id: { $in: normalizeToArray(attachmentIds) } }).lean();
};

exports.addAttachments = async (payload) => {
  return Attachment.insertMany(payload);
};

exports.deleteAttachmentById = async (attachmentId) => {
  return Attachment.findByIdAndDelete(attachmentId);
};

exports.deleteAttachmentsByResourceIds = async (resourceIds) => {
  return Attachment.deleteMany({ resourceId: { $in: normalizeToArray(resourceIds) } });
};

exports.deleteAttachmentsByResourceIds = async (resourceIds) => {
  return Attachment.deleteMany({ resourceId: { $in: normalizeToArray(resourceIds) } });
};

exports.bulkDeleteAttachmentsByIds = async (attachmentIds) => {
  return Attachment.deleteMany({ _id: { $in: normalizeToArray(attachmentIds) } });
};
