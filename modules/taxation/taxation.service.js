// Services
const attachmentService = require("../attachment/attachment.service");

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
const removeUploadedFiles = require("../../utils/removeUploadedFiles");

const startOfYear = (year) => new Date(Date.UTC(year, 0, 1));
const endOfYear = (year) => new Date(Date.UTC(year, 11, 31));

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
  try {
    const validatedPayload = joi.validate(payload, joiSchema.createTaxation);
    isValidDateRange(validatedPayload.startDate, validatedPayload.endDate);

    const fleet = await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);
    validatedPayload.company = fleet.company;

    if (validatedPayload.jurisdiction) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.jurisdiction);
    }

    validatedPayload.startDate = startOfYear(validatedPayload.startDate);
    validatedPayload.endDate = endOfYear(validatedPayload.endDate);

    if (validatedPayload.filingDate) {
      isValidDateRange(validatedPayload.filingDate);
    }

    const taxation = await taxationRepository.createTaxation(validatedPayload);

    const updatePayload = {};

    if (attachmentPayload?.documents?.length) {
      await attachmentService.addAttachments({
        resource: MODELS.TAXATION,
        resourceId: taxation._id,
        files: attachmentPayload.documents,
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.documents = attachmentPayload.documents.map((document) => document.path);
    }

    if (!Object.keys(updatePayload).length) return taxation;

    return taxationRepository.updateTaxationById(taxation._id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.updateTaxation = async (payload, attachmentPayload) => {
  try {
    const validatedPayload = joi.validate(payload, joiSchema.updateTaxation);

    const existingTaxation = await taxationValidation.throwErrorIfTaxationDoesNotExist(validatedPayload.id);
    const updatePayload = {};

    if (validatedPayload.fleet && validatedPayload.fleet !== String(existingTaxation?.fleet._id)) {
      await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);

      updatePayload.fleet = validatedPayload.fleet;
    }

    if (validatedPayload.challanNumber && validatedPayload.challanNumber !== existingTaxation?.challanNumber) {
      updatePayload.challanNumber = validatedPayload.challanNumber;
    }

    if (validatedPayload.jurisdiction && validatedPayload.jurisdiction !== String(existingTaxation?.jurisdiction._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.jurisdiction);

      updatePayload.jurisdiction = validatedPayload.jurisdiction;
    }

    const updatedStartDate = startOfYear(validatedPayload.startDate) || existingTaxation?.startDate;
    const updatedEndDate = endOfYear(validatedPayload.endDate) || existingTaxation?.endDate;
    isValidDateRange(updatedStartDate, updatedEndDate);

    if (validatedPayload.startDate && !isSameDay(validatedPayload.startDate, existingTaxation?.startDate)) {
      updatePayload.startDate = startOfYear(validatedPayload.startDate);
    }

    if (validatedPayload.endDate && !isSameDay(validatedPayload.endDate, existingTaxation?.endDate)) {
      updatePayload.endDate = endOfYear(validatedPayload.endDate);
    }

    if (validatedPayload.filingDate && !isSameDay(validatedPayload.filingDate, existingTaxation?.filingDate)) {
      updatePayload.filingDate = validatedPayload.filingDate;
    }

    if (validatedPayload.amount && validatedPayload.amount !== existingTaxation?.amount) {
      updatePayload.amount = validatedPayload.amount;
    }

    if (validatedPayload.notes && validatedPayload.notes !== existingTaxation?.notes) {
      updatePayload.notes = validatedPayload.notes;
    }

    if (attachmentPayload?.documents?.length) {
      await attachmentService.addAttachments({
        resource: MODELS.TAXATION,
        resourceId: existingTaxation._id,
        files: attachmentPayload.documents,
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.documents = attachmentPayload.documents.map((document) => document.path);
    }

    if (!Object.keys(updatePayload).length) return existingTaxation;

    return taxationRepository.updateTaxationById(validatedPayload.id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.deleteTaxation = async (taxationId) => {
  joi.validate(taxationId, joiSchema.getTaxationById);

  await taxationValidation.throwErrorIfTaxationDoesNotExist(taxationId);
  await attachmentService.deleteAttachmentsByResource(MODELS.TAXATION, taxationId);
  await taxationRepository.deleteTaxationById(taxationId);

  return { deletedId: taxationId };
};
