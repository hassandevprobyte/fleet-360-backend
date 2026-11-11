// Repositories
const depreciationRepository = require("./depreciation.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./depreciation.schema");
const vehicleValidation = require("../vehicle/vehicle.validation");
const depreciationValidation = require("./depreciation.validation");

// Helpers
const depreciationHelpers = require("./depreciation.helper");

// Utilities
const validators = require("../../common/validators");

exports.getAllDepreciations = async (filters) => {
  return depreciationRepository.getAllDepreciations(filters);
};

exports.getDepreciationsWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [depreciations, totalCount] = await Promise.all([
    depreciationRepository.getDepreciationsWithPagination(filters, offset, pageSize, sort),
    depreciationRepository.getDepreciationsCount(filters),
  ]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: depreciations, meta };
};

exports.getDepreciationById = async (depreciationId) => {
  joi.validate(depreciationId, joiSchema.getDepreciationById);

  return depreciationValidation.throwErrorIfDepreciationDoesNotExist(depreciationId);
};

exports.createDepreciation = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createDepreciation);

  await vehicleValidation.throwErrorIfVehicleDoesNotExist(validatedPayload.vehicle);
  depreciationHelpers.validateDepreciationMethod(validatedPayload);

  await depreciationValidation.throwErrorIfDepreciationVehicleExists(validatedPayload.vehicle);

  return depreciationRepository.createDepreciation(validatedPayload);
};

exports.updateDepreciation = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateDepreciation);

  const existingDepreciation = await depreciationValidation.throwErrorIfDepreciationDoesNotExist(validatedPayload.id);
  const updatePayload = {};

  if (validatedPayload.vehicle && String(validatedPayload.vehicle) !== String(existingDepreciation?.vehicle._id)) {
    await vehicleValidation.throwErrorIfVehicleDoesNotExist(validatedPayload.vehicle);
    await depreciationValidation.throwErrorIfDepreciationVehicleExists(validatedPayload.vehicle);

    updatePayload.vehicle = validatedPayload.vehicle;
  }

  if (validatedPayload.method && validatedPayload.method !== existingDepreciation.method) {
    updatePayload.method = validatedPayload.method;
  }

  if (validatedPayload.salvageValue && validatedPayload.salvageValue !== existingDepreciation?.salvageValue) {
    updatePayload.salvageValue = validatedPayload.salvageValue;
  }

  if (validatedPayload.usefulLifeMonths && validatedPayload.usefulLifeMonths !== existingDepreciation?.usefulLifeMonths) {
    updatePayload.usefulLifeMonths = validatedPayload.usefulLifeMonths;
  }

  if (validatedPayload.depreciationRate && validatedPayload.depreciationRate !== existingDepreciation?.depreciationRate) {
    updatePayload.depreciationRate = validatedPayload.depreciationRate;
  }

  if (validatedPayload.acquisitionCost && validatedPayload.acquisitionCost !== existingDepreciation?.acquisitionCost) {
    updatePayload.acquisitionCost = validatedPayload.acquisitionCost;
  }

  if (validatedPayload.totalAcquiredUnits && validatedPayload.totalAcquiredUnits !== existingDepreciation?.totalAcquiredUnits) {
    updatePayload.totalAcquiredUnits = validatedPayload.totalAcquiredUnits;
  }

  if (validatedPayload.totalExpectedUnits && validatedPayload.totalExpectedUnits !== existingDepreciation?.totalExpectedUnits) {
    updatePayload.totalExpectedUnits = validatedPayload.totalExpectedUnits;
  }

  if (validatedPayload.startDate && !validators.isSameDay(validatedPayload.startDate, existingDepreciation?.startDate)) {
    updatePayload.startDate = validatedPayload.startDate;
  }

  depreciationHelpers.validateDepreciationMethod({ ...existingDepreciation, ...updatePayload });

  if (!Object.keys(updatePayload).length) return existingDepreciation;

  return depreciationRepository.updateDepreciationById(validatedPayload.id, updatePayload);
};

exports.deleteDepreciation = async (depreciationId) => {
  joi.validate(depreciationId, joiSchema.getDepreciationById);

  await depreciationValidation.throwErrorIfDepreciationDoesNotExist(depreciationId);

  await depreciationRepository.deleteDepreciationById(depreciationId);

  return { deletedId: depreciationId };
};

exports.deleteDepreciationByVehicleId = async (depreciationId) => {
  joi.validate(depreciationId, joiSchema.getDepreciationById);

  await depreciationValidation.throwErrorIfDepreciationDoesNotExist(depreciationId);

  await depreciationRepository.deleteDepreciationById(depreciationId);

  return { deletedId: depreciationId };
};
