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
