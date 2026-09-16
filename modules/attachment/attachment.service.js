const fs = require("fs/promises");

// Repositories
const attachmentRepository = require("./attachment.repository");

// Validations
const joi = require("../../config/joi");
const joiSchema = require("./attachment.schema");
const attachmentValidation = require("./attachment.validation");

exports.getAttachmentById = async (attachmentId) => {
  joi.validate(attachmentId, joiSchema.getAttachmentById);

  return attachmentValidation.throwErrorIfAttachmentDoesNotExist(attachmentId);
};

exports.getAttachmentsByResource = async (resource, resourceId) => {
  await attachmentValidation.throwErrorIfResourceDoesNotExist(resource, resourceId);

  return attachmentRepository.getAttachmentsByResource(resource, resourceId);
};

exports.addAttachments = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.addAttachments);

  await attachmentValidation.throwErrorIfResourceDoesNotExist(validatedPayload.resource, validatedPayload.resourceId);

  const addPayload = validatedPayload.files.map((file) => ({
    resource: validatedPayload.resource,
    resourceId: validatedPayload.resourceId,
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    filePath: file.path,
    uploadedBy: validatedPayload.uploadedBy,
  }));

  return attachmentRepository.addAttachments(addPayload);
};

exports.deleteAttachment = async (attachmentId) => {
  joi.validate(attachmentId, joiSchema.getAttachmentById);

  const attachment = await attachmentValidation.throwErrorIfAttachmentDoesNotExist(attachmentId);

  try {
    await fs.unlink(attachment.filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  await attachmentRepository.deleteAttachmentById(attachmentId);

  return { deletedId: attachmentId };
};

exports.deleteAttachmentsByResource = async (resource, resourceId) => {
  const attachments = await attachmentRepository.getAttachmentsByResource(resource, resourceId);

  await Promise.all(
    attachments.map(async (attachment) => {
      try {
        await fs.unlink(attachment.filePath);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }
    }),
  );

  return attachmentRepository.deleteAttachmentsByResourceIds(resourceId);
};
