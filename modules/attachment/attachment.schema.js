const Joi = require("joi");
const { objectId } = require("../../config");

// Constants
const MODELS = require("../../constants/MODELS");

exports.getAttachmentById = objectId.required();

exports.addAttachments = Joi.object({
  resource: Joi.string()
    .valid(...Object.values(MODELS))
    .required(),
  resourceId: objectId.required(),
  files: Joi.array().items(Joi.object().unknown(true)).min(1).required(),
  uploadedBy: objectId.optional(),
});
