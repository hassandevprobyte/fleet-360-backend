const Boom = require("@hapi/boom");
const mongoose = require("mongoose");

// Repositories
const attachmentRepository = require("./attachment.repository");

// Constants
const { MESSAGE: message } = require("../../common/constants");

exports.throwErrorIfAttachmentDoesNotExist = async (attachmentId) => {
  const attachment = await attachmentRepository.getAttachmentById(attachmentId);

  if (!attachment) {
    throw Boom.notFound(message.error.attachment.notFound);
  }

  return attachment;
};

exports.throwErrorIfResourceDoesNotExist = async (resource, resourceId) => {
  const Model = mongoose.models[resource];

  if (!Model) {
    throw Boom.conflict(`Model ${resource} not registered`);
  }

  const exists = await Model.exists({ _id: resourceId });

  if (!exists) {
    throw Boom.conflict(message.error.attachment.resourceNotFound(resource));
  }
};

exports.throwErrorIfAnyAttachmentDoesNotExist = async (attachmentIds) => {
  const attachments = await attachmentRepository.getAttachmentsByIds(attachmentIds);

  if (attachments.length !== attachmentIds.length) {
    throw Boom.notFound(message.error.attachment.notFound);
  }

  return attachments;
};
