const Joi = require("../../config/joi");

// Constants
const { MODELS } = require("../../common/constants");

exports.getAttachmentById = Joi.objectId().required();

exports.getAttachmentsByIds = Joi.array().items(Joi.objectId()).unique();

exports.addAttachments = Joi.object({
  resource: Joi.string()
    .valid(...Object.values(MODELS))
    .required(),
  resourceId: Joi.objectId().required(),
  files: Joi.array().items(Joi.object().unknown(true)).min(1).required(),
  uploadedBy: Joi.objectId().required(),
});
