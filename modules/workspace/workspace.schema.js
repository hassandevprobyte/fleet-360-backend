const Joi = require("../../config/joi");

// Constants
const { CURRENCY, DEPRECIATION, STATUSES, TIMEZONE } = require("../../common/constants");

exports.getWorkspaceById = Joi.objectId().required();

exports.baseSchema = Joi.object({
  user: Joi.objectId(),
  title: Joi.string().trim().lowercase(),
  description: Joi.string().trim().lowercase(),
  slug: Joi.string().trim(),
  color: Joi.string().trim(),
  status: Joi.string()
    .trim()
    .valid(...Object.values(STATUSES.WORKSPACE))
    .default(STATUSES.WORKSPACE.ACTIVE),
  depreciation: Joi.string()
    .trim()
    .valid(...Object.values(DEPRECIATION.METHODS).map((method) => method.VALUE)),
  members: Joi.array()
    .items(
      Joi.object({
        user: Joi.objectId(),
        assignedAt: Joi.date(),
      }),
    )
    .unique("user"),
  settings: Joi.object({
    timezone: Joi.string()
      .trim()
      .valid(...Object.values(TIMEZONE))
      .default(TIMEZONE.UTC),
    currency: Joi.string()
      .trim()
      .uppercase()
      .valid(...Object.values(CURRENCY)),
  }),
});

exports.createWorkspace = exports.baseSchema
  .fork(["user"], (field) => field.required())
  .fork("title", (schema) => schema.default("untitled"))
  .fork("settings.timezone", (schema) => schema.default(TIMEZONE.UTC))
  .fork("settings.currency", (schema) => schema.default(CURRENCY.USD));

exports.updateWorkspace = exports.baseSchema.append({ id: Joi.objectId().required() });
