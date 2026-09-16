const Joi = require("joi");
const { objectId } = require("../../config");

// Constants
const CRUD = require("../../constants/CRUD");
const SCOPE = require("../../constants/SCOPE");

exports.getRoleById = objectId.required();

exports.baseSchema = Joi.object({
  title: Joi.string().lowercase().trim().min(2).max(255),
  permissions: Joi.array()
    .min(1)
    .items(
      Joi.object({
        resource: Joi.string().trim().required(),
        actions: Joi.array()
          .items(
            Joi.string()
              .lowercase()
              .valid(...Object.values(CRUD)),
          )
          .unique()
          .min(1)
          .required(),
        allowedUpdateFields: Joi.array()
          .unique()
          .items(Joi.string())
          .when("actions", {
            is: Joi.array().items(Joi.string().valid(CRUD.UPDATE)),
            then: Joi.required(),
          }),
      }),
    ),
  scope: Joi.string()
    .lowercase()
    .trim()
    .valid(...Object.values(SCOPE)),
  indexPath: Joi.string().lowercase().trim().min(1).max(255),
});

exports.createRole = exports.baseSchema.fork(["title", "permissions", "scope", "indexPath"], (schema) => schema.required());

exports.updateRole = exports.baseSchema.append({ id: objectId.required() });
