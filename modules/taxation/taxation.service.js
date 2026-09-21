// Repositories
const taxationRepository = require("./taxation.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./taxation.schema");
const fleetValidation = require("../fleet/fleet.validation");
const picklistValidation = require("../picklist/picklist.validation");
const taxationValidation = require("./taxation.validation");

// Constants
const MODELS = require("../../constants/MODELS");

// Utilities
const isValidDateRange = require("../../utils/isValidDateRange");
const isSameDay = require("../../utils/isSameDay");

exports.getAllTaxation = async (filters) => {
  return taxationRepository.getAllTaxation(filters);
};

exports.getTaxationWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [taxation, totalCount] = await Promise.all([taxationRepository.getTaxationWithPagination(filters, offset, pageSize, sort), taxationRepository.getTaxationCount(filters)]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };
  return { data: taxation, meta };
};

exports.getTaxationById = async (taxationId) => {
  joi.validate(taxationId, joiSchema.getTaxationById);

  return taxationValidation.throwErrorIfTaxationDoesNotExist(taxationId);
};

exports.createTaxation = async (payload, attachmentPayload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createTaxation);
  isValidDateRange(validatedPayload.startDate, validatedPayload.endDate);

  await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleetId);

  if (validatedPayload.jurisdiction) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.jurisdiction);
  }

  if (validatedPayload.status) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);
  } else {
    const status = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.TAXATION, "status");

    validatedPayload.status = status._id;
  }

  if (validatedPayload.filingDate) {
    isValidDateRange(validatedPayload.filingDate);
  }

  const taxation = await taxationRepository.createTaxation(validatedPayload);

  if (attachmentPayload?.files?.length) {
    await attachmentService.addAttachments({
      resource: MODELS.TAXATION,
      resourceId: taxation._id,
      files: attachmentPayload.files,
      uploadedBy: attachmentPayload.uploadedBy,
    });
  }

  return taxation;
};

exports.updateTaxation = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateTaxation);

  const existingTaxation = await taxationValidation.throwErrorIfTaxationDoesNotExist(validatedPayload.id);
  const updatePayload = {};

  if (validatedPayload.fleet && validatedPayload.fleet !== String(existingTaxation?.fleet._id)) {
    await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);

    updatePayload.fleet = validatedPayload.fleet;
  }

  if (validatedPayload.taxChallanNumber && validatedPayload.taxChallanNumber !== existingTaxation?.taxChallanNumber) {
    updatePayload.taxChallanNumber = validatedPayload.taxChallanNumber;
  }

  if (validatedPayload.jurisdiction && validatedPayload.jurisdiction !== String(existingTaxation?.jurisdiction._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.jurisdiction);

    updatePayload.jurisdiction = validatedPayload.jurisdiction;
  }

  if (validatedPayload.status && validatedPayload.status !== String(existingTaxation?.status._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);

    updatePayload.status = validatedPayload.status;
  }

  const updatedStartDate = validatedPayload.startedDate || existingTaxation?.startedDate;
  const updatedEndDate = validatedPayload.endDate || existingTaxation?.endDate;
  isValidDateRange(updatedStartDate, updatedEndDate);

  if (validatedPayload.startedDate && !isSameDay(validatedPayload.startedDate, existingTaxation?.startedDate)) {
    updatePayload.startedDate = validatedPayload.startedDate;
  }

  if (validatedPayload.endDate && !isSameDay(validatedPayload.endDate, existingTaxation?.endDate)) {
    updatePayload.endDate = validatedPayload.endDate;
  }

  if (validatedPayload.filingDate && !isSameDay(validatedPayload.filingDate, existingTaxation?.filingDate)) {
    updatePayload.filingDate = validatedPayload.filingDate;
  }

  if (validatedPayload.taxAmount && validatedPayload.taxAmount !== existingTaxation?.taxAmount) {
    updatePayload.taxAmount = validatedPayload.taxAmount;
  }

  if (validatedPayload.notes && validatedPayload.notes !== existingTaxation?.notes) {
    updatePayload.notes = validatedPayload.notes;
  }

  if (!Object.keys(updatePayload).length) return existingTaxation;

  return taxationRepository.updateTaxationById(validatedPayload.id, updatePayload);
};

exports.deleteTaxation = async (taxationId) => {
  joi.validate(taxationId, joiSchema.getTaxationById);

  await taxationValidation.throwErrorIfTaxationDoesNotExist(taxationId);

  await taxationRepository.deleteTaxationById(taxationId);

  return { deletedId: taxationId };
};
