const Joi = require("joi");
const { objectId } = require("../../config");

// Constants
const ENUMS = require("../../constants/ENUMS");

exports.getFleetById = objectId.required();

const driverDetailsSchema = Joi.object({
  user: objectId.required(),
  licenseNumber: Joi.string().trim().min(3).max(255).required(),
  licenseExpiry: Joi.date().required(),
});

exports.baseSchema = Joi.object({
  company: objectId,
  make: objectId,
  model: objectId,
  year: Joi.number().min(1900).max(2100),
  type: objectId,
  fuelType: objectId,
  transmission: objectId,
  color: Joi.string().lowercase().trim().min(3).max(255),
  licensePlate: Joi.string().trim().min(1).max(255),
  purchaseAmount: Joi.number().positive(),
  purchaseDate: Joi.date(),
  rent: Joi.number().positive(),
  initialOdometer: Joi.number().positive(),
  currentOdometer: Joi.number().positive(),
  status: Joi.string().valid(...Object.values(ENUMS.FLEET.STATUSES)),
  condition: objectId,
  assignedBy: objectId,
  assignedOn: Joi.date(),
  inspector: objectId,
  createdBy: objectId,
});

exports.createFleet = exports.baseSchema
  .fork(
    ["make", "model", "year", "type", "fuelType", "transmission", "color", "licensePlate", "purchaseAmount", "purchaseDate", "rent", "initialOdometer", "status", "condition"],
    (schema) => schema.required(),
  )
  .keys({
    status: Joi.string().default(ENUMS.FLEET.STATUSES.IN_HOUSE),
    driverDetails: Joi.when("status", {
      switch: [
        {
          is: ENUMS.FLEET.STATUSES.IN_HOUSE,
          then: Joi.forbidden(),
        },
        {
          is: ENUMS.FLEET.STATUSES.ASSIGNED,
          then: driverDetailsSchema.required(),
        },
        {
          is: ENUMS.FLEET.STATUSES.IN_MAINTENANCE,
          then: driverDetailsSchema.optional(),
        },
      ],
    }),
  });

exports.updateFleet = exports.baseSchema
  .append({ id: objectId.required() })
  .fork("createdBy", (schema) => schema.strip())
  .keys({
    driverDetails: Joi.when("status", {
      switch: [
        {
          is: ENUMS.FLEET.STATUSES.IN_HOUSE,
          then: Joi.forbidden(),
        },
        {
          is: ENUMS.FLEET.STATUSES.ASSIGNED,
          then: driverDetailsSchema.required(),
        },
        {
          is: ENUMS.FLEET.STATUSES.IN_MAINTENANCE,
          then: driverDetailsSchema.optional(),
        },
      ],
    }),
  });

exports.getFleetsSummaryByGroup = Joi.object({
  filters: Joi.object().default({}).optional(),
  primaryGroup: Joi.string().trim().valid("make", "model", "type", "fuelType", "transmission", "status", "condition").default("make").optional(),
  secondaryGroup: Joi.string().trim().valid("make", "model", "type", "fuelType", "transmission", "status", "condition").default("model").optional(),
});
