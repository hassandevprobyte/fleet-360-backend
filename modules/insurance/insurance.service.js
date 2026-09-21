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
  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type);

  if (validatedPayload.broker) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.broker);
  }

  if (validatedPayload.status) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);
  } else {
    const status = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "status");

    validatedPayload.status = status._id;
  }

  if (validatedPayload.coverages?.length) {
    await Promise.all(validatedPayload.coverages.map((coverage) => picklistValidation.throwErrorIfPicklistDoesNotExist(coverage.type)));
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

  if (validatedPayload.type && validatedPayload.type !== String(existingInsurance?.type?._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type);
    updatePayload.type = validatedPayload.type;
  }

  if (validatedPayload.broker && validatedPayload.broker !== String(existingInsurance?.broker?._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.broker);

    updatePayload.broker = validatedPayload.broker;
  }

  if (validatedPayload.status && validatedPayload.status !== String(existingInsurance?.status?._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);
    updatePayload.status = validatedPayload.status;
  }

  const updatedStartDate = validatedPayload.startedDate || existingTaxation?.startedDate;
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

  if (validatedPayload.totalPremium && validatedPayload.totalPremium !== existingInsurance?.totalPremium) {
    updatePayload.totalPremium = validatedPayload.totalPremium;
  }

  if (validatedPayload.taxAmount && validatedPayload.taxAmount !== existingInsurance?.taxAmount) {
    updatePayload.taxAmount = validatedPayload.taxAmount;
  }

  if (validatedPayload.discountAmount && validatedPayload.discountAmount !== existingInsurance?.discountAmount) {
    updatePayload.discountAmount = validatedPayload.discountAmount;
  }

  if (validatedPayload.totalAmount && validatedPayload.totalAmount !== existingInsurance?.totalAmount) {
    updatePayload.totalAmount = validatedPayload.totalAmount;
  }

  if (validatedPayload.deductible && validatedPayload.deductible !== existingInsurance?.deductible) {
    updatePayload.deductible = validatedPayload.deductible;
  }

  if (validatedPayload.coverages && !lodash.isEqual(validatedPayload.coverages, existingInsurance?.coverages)) {
    await Promise.all(validatedPayload.coverages.map((coverage) => picklistValidation.throwErrorIfPicklistDoesNotExist(coverage.type)));

    updatePayload.coverages = validatedPayload.coverages;
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
