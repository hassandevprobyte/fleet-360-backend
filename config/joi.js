const Joi = require("joi");
const dayjs = require("../libs/dayjs");
const validators = require("../common/validators");

const ExtendedJoi = Joi.extend(
  (joi) => ({
    type: "objectId",
    messages: { "objectId.invalid": "{{#label}} must be a valid MongoDB ObjectId" },
    validate(value, helpers) {
      if (!validators.isValidObjectId(value)) return { errors: helpers.error("objectId.invalid") };
    },
  }),
  (joi) => ({
    type: "monthDate",
    base: joi.date(),
    validate: (value) => ({ value: dayjs(value).utc().startOf("month").toDate() }),
  }),
);

ExtendedJoi.validate = (payload, schema, options) => {
  const { value, error } = schema.validate(payload, options);

  if (error) throw error;

  return value;
};

module.exports = ExtendedJoi;
