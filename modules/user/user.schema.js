const Joi = require("../../config/joi");

// Constants
const { STATUSES, ROLES } = require("../../common/constants");

exports.getUserById = Joi.string().required();

exports.baseSchema = Joi.object({
  name: Joi.string().lowercase().trim().min(2).max(255),
  email: Joi.string().email().lowercase().trim().min(2).max(255),
  password: Joi.string().empty(""),
  platformRole: Joi.string().valid(...Object.values(ROLES.PLATFORM_ROLES)),
  workspaceRole: Joi.string().valid(...Object.values(ROLES.WORKSPACE_ROLES)),
  permissions: Joi.array().items(Joi.string()),
  status: Joi.string().valid(...Object.values(STATUSES.USER)),
  isActive: Joi.boolean(),
  isEmailVerified: Joi.boolean(),
  emailVerifiedAt: Joi.date(),
});

exports.createUser = exports.baseSchema
  .fork(["name", "email"], (schema) => schema.required())
  .fork("password", (schema) => schema.default("Abcd1234"))
  .fork("status", (schema) => schema.default(STATUSES.USER.ACTIVE))
  .fork("isActive", (schema) => schema.default(true))
  .fork("isEmailVerified", (schema) => schema.default(false))
  .fork("workspaceRole", (schema) =>
    schema.when("platformRole", {
      is: ROLES.PLATFORM_ROLES.USER,
      then: schema.required(),
    }),
  )
  .fork("permissions", (schema) =>
    schema.when("workspaceRole", {
      is: Joi.exist(),
      then: schema.min(1).required(),
    }),
  );

exports.updateUser = exports.baseSchema
  .append({ id: Joi.objectId().required() })
  .fork("workspaceRole", (schema) =>
    schema.when("platformRole", {
      is: ROLES.PLATFORM_ROLES.USER,
      then: schema.required(),
    }),
  )
  .fork("permissions", (schema) =>
    schema.when("workspaceRole", {
      is: Joi.exist(),
      then: schema.min(1).required(),
    }),
  );
