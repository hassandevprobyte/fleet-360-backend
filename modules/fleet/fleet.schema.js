const Joi = require("../../config/joi");

// Constants
const { STATUSES } = require("../../common/constants");

exports.getFleetById = Joi.objectId().required();

const driverDetailsSchema = Joi.object({
  user: Joi.objectId().required(),
  licenseNumber: Joi.string().trim().min(3).max(255).required(),
  licenseExpiry: Joi.date().required(),
});

exports.baseSchema = Joi.object({
  workspace: Joi.objectId(),
  make: Joi.objectId(),
  model: Joi.objectId(),
  year: Joi.number().min(1900).max(2100),
  type: Joi.objectId(),
  fuelType: Joi.objectId(),
  transmission: Joi.objectId(),
  color: Joi.string().lowercase().trim().min(3).max(255),
  licensePlate: Joi.string().trim().min(1).max(255),
  purchaseAmount: Joi.number().min(0),
  purchaseDate: Joi.date(),
  rent: Joi.number().min(0),
  initialOdometer: Joi.number().min(0),
  currentOdometer: Joi.number().min(0),
  status: Joi.string().valid(...Object.values(STATUSES.FLEET)),
  condition: Joi.objectId(),
  driverDetails: Joi.object({}),
  assignedBy: Joi.objectId(),
  assignedOn: Joi.date(),
  inspector: Joi.objectId(),
  createdBy: Joi.objectId(),
});

exports.createFleet = exports.baseSchema
  .fork(
    [
      "workspace",
      "make",
      "model",
      "year",
      "type",
      "fuelType",
      "transmission",
      "color",
      "licensePlate",
      "purchaseAmount",
      "purchaseDate",
      "rent",
      "initialOdometer",
      "status",
      "condition",
    ],
    (schema) => schema.required(),
  )
  .fork("status", (schema) => schema.default(STATUSES.FLEET.IN_HOUSE))
  .keys({
    driverDetails: Joi.when("status", {
      switch: [
        {
          is: STATUSES.FLEET.IN_HOUSE,
          then: Joi.forbidden(),
        },
        {
          is: STATUSES.FLEET.ASSIGNED,
          then: driverDetailsSchema.required(),
        },
        {
          is: STATUSES.FLEET.IN_MAINTENANCE,
          then: driverDetailsSchema.optional(),
        },
      ],
    }),
  });

exports.updateFleet = exports.baseSchema
  .append({ id: Joi.objectId().required(), removedDocuments: Joi.array().items(Joi.objectId()).unique(), removedImages: Joi.array().items(Joi.objectId()).unique() })
  .fork("createdBy", (schema) => schema.strip())
  .keys({
    driverDetails: Joi.when("status", {
      switch: [
        {
          is: STATUSES.FLEET.IN_HOUSE,
          then: Joi.forbidden(),
        },
        {
          is: STATUSES.FLEET.ASSIGNED,
          then: driverDetailsSchema.required(),
        },
        {
          is: STATUSES.FLEET.IN_MAINTENANCE,
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
