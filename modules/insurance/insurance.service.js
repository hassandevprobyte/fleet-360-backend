const lodash = require("lodash");

// Services
const attachmentService = require("../attachment/attachment.service");

// Repositories
const insuranceRepository = require("./insurance.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./insurance.schema");
const fleetValidation = require("../fleet/fleet.validation");
const insuranceValidation = require("./insurance.validation");
const picklistValidation = require("../picklist/picklist.validation");

// Constants
const MODELS = require("../../constants/MODELS");

// Utilities
const isSameDay = require("../../utils/isSameDay");
const isValidDateRange = require("../../utils/isValidDateRange");

exports.getAllInsurance = async (filters) => {
  return insuranceRepository.getAllInsurance(filters);
};

exports.getInsuranceWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [insurance, totalCount] = await Promise.all([
    insuranceRepository.getInsuranceWithPagination(filters, offset, pageSize, sort),
    insuranceRepository.getInsuranceCount(filters),
  ]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };
  return { data: insurance, meta };
};

exports.getInsuranceById = async (insuranceId) => {
  joi.validate(insuranceId, joiSchema.getInsuranceById);

  return insuranceValidation.throwErrorIfInsuranceDoesNotExist(insuranceId);
};

exports.createInsurance = async (payload, attachmentPayload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createInsurance);
  isValidDateRange(validatedPayload.startDate, validatedPayload.endDate);

  await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);
  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.provider);

  if (validatedPayload.status) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);
  } else {
    const status = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "status");

    validatedPayload.status = status._id;
  }

  const insurance = await insuranceRepository.createInsurance(validatedPayload);

  if (attachmentPayload?.files?.length) {
    await attachmentService.addAttachments({
      resource: MODELS.INSURANCE,
      resourceId: insurance._id,
      files: attachmentPayload.files,
      uploadedBy: attachmentPayload.uploadedBy,
    });
  }

  return insurance;
};

exports.updateInsurance = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateInsurance);

  const existingInsurance = await insuranceValidation.throwErrorIfInsuranceDoesNotExist(validatedPayload.id);
  const updatePayload = {};

  if (validatedPayload.fleet && validatedPayload.fleet !== String(existingInsurance?.fleet?._id)) {
    await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);
    updatePayload.fleet = validatedPayload.fleet;
  }

  if (validatedPayload.policyNumber && validatedPayload.policyNumber !== existingInsurance?.policyNumber) {
    updatePayload.policyNumber = validatedPayload.policyNumber;
  }

  if (validatedPayload.provider && validatedPayload.provider !== String(existingInsurance?.provider?._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.provider);
    updatePayload.provider = validatedPayload.provider;
  }

  if (validatedPayload.status && validatedPayload.status !== String(existingInsurance?.status?._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);
    updatePayload.status = validatedPayload.status;
  }

  const updatedStartDate = validatedPayload.startDate || existingTaxation?.startDate;
  const updatedEndDate = validatedPayload.endDate || existingTaxation?.endDate;
  isValidDateRange(updatedStartDate, updatedEndDate);

  if (validatedPayload.startDate && !isSameDay(validatedPayload.startDate, existingInsurance?.startDate)) {
    updatePayload.startDate = validatedPayload.startDate;
  }

  if (validatedPayload.endDate && !isSameDay(validatedPayload.endDate, existingInsurance?.endDate)) {
    updatePayload.endDate = validatedPayload.endDate;
  }

  if (validatedPayload.cancellationDate && !isSameDay(validatedPayload.cancellationDate, existingInsurance?.cancellationDate)) {
    updatePayload.cancellationDate = validatedPayload.cancellationDate;
  }

  if (validatedPayload.cancellationReason && validatedPayload.cancellationReason !== existingInsurance?.cancellationReason) {
    updatePayload.cancellationReason = validatedPayload.cancellationReason;
  }

  if (validatedPayload.premium && validatedPayload.premium !== existingInsurance?.premium) {
    updatePayload.premium = validatedPayload.premium;
  }

  if (validatedPayload.coverage && validatedPayload.coverage !== existingInsurance?.coverage) {
    updatePayload.coverage = validatedPayload.coverage;
  }

  if (validatedPayload.notes && validatedPayload.notes !== existingInsurance?.notes) {
    updatePayload.notes = validatedPayload.notes;
  }

  if (!Object.keys(updatePayload).length) {
    return existingInsurance;
  }

  return insuranceRepository.updateInsuranceById(validatedPayload.id, updatePayload);
};

exports.deleteInsurance = async (insuranceId) => {
  joi.validate(insuranceId, joiSchema.getInsuranceById);

  await insuranceValidation.throwErrorIfInsuranceDoesNotExist(insuranceId);

  await insuranceRepository.deleteInsuranceById(insuranceId);

  return { deletedId: insuranceId };
};
