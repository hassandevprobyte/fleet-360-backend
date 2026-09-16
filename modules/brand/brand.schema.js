const Joi = require("joi");
const { objectId } = require("../../config");

exports.getBrandById = objectId.required();

exports.baseSchema = Joi.object({
  title: Joi.string().lowercase().trim().min(2).max(255),
  acronym: Joi.string().uppercase().trim().min(2).max(10),
  company: objectId,
  brandUrl: Joi.string().uri().lowercase().trim(),
  imgUrl: Joi.string(),
  isActive: Joi.boolean(),
});

exports.createBrand = exports.baseSchema.fork(["title", "acronym", "company", "brandUrl"], (schema) => schema.required()).fork("isActive", (schema) => schema.default(true));

exports.updateBrand = exports.baseSchema.append({ id: objectId.required() });
