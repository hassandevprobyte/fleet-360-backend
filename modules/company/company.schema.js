const Joi = require("joi");
const { objectId } = require("../../config");

exports.getCompanyById = objectId.required();

exports.baseSchema = Joi.object({
  title: Joi.string().lowercase().trim().min(2).max(255),
  acronym: Joi.string().uppercase().trim().min(2).max(10),
  imgUrl: Joi.string(),
  website: Joi.string().uri().trim(),
  phone: Joi.string().trim().min(10).max(15),
  address: Joi.object({
    street: Joi.string().lowercase().trim().min(2).max(255),
    state: Joi.string().lowercase().trim().min(2).max(255),
    city: Joi.string().lowercase().trim().min(2).max(255),
    country: Joi.string().lowercase().trim().min(2).max(255),
    zipCode: Joi.string().trim().min(4).max(255),
  }),
});

exports.createCompany = exports.baseSchema.fork(["title", "acronym"], (schema) => schema.required());

exports.updateCompany = exports.baseSchema.append({ id: objectId.required() });
