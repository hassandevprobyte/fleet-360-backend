// Services
const attachmentService = require("./attachment.service");

// Repositories
const attachmentRepository = require("./attachment.repository");

exports.attachAttachmentsToDocuments = async (documents) => {
  if (!documents) return documents;

  const normalizedDocuments = Array.isArray(documents) ? documents : [documents];

  if (!normalizedDocuments.length) return normalizedDocuments;

  const documentIds = normalizedDocuments.map((d) => d._id);

  const attachments = await attachmentRepository.getAttachmentsGroupedByResourceIds(documentIds);
  const attachmentsMap = new Map(attachments.map((item) => [String(item._id), item.attachments]));

  const enrichedDocuments = normalizedDocuments.map((d) => ({ ...d, attachments: attachmentsMap.get(String(d._id)) || [] }));

  return Array.isArray(documents) ? enrichedDocuments : enrichedDocuments[0];
};

exports.buildAttachmentUpdate = async ({ update = {}, field, resource, resourceId, removedIds = [], files, uploadedBy, existingIds = [] }) => {
  const normalizeId = (item) => item?._id ?? item;

  const removedIdSet = new Set(removedIds.filter(Boolean).map(String));

  let attachmentIds = existingIds
    .map(normalizeId)
    .filter((id) => id && String(id) !== "undefined" && String(id) !== "null")
    .filter((id) => !removedIdSet.has(String(id)));

  if (removedIds.length) {
    await attachmentService.deleteAttachments(removedIds);
  }

  if (files?.length) {
    const attachments = await attachmentService.addAttachments({
      resource,
      resourceId,
      files,
      uploadedBy,
    });

    attachmentIds.push(...attachments.map(({ _id }) => _id));
  }

  if (removedIds.length || files?.length) {
    update.$set = {
      ...(update.$set || {}),
      [field]: attachmentIds,
    };
  }

  return update;
};
