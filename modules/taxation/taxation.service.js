// Services
const attachmentService = require("../attachment/attachment.service");

// Repositories
const taxationRepository = require("./taxation.repository");

// Validations
const joi = require("../../config/joi");
const joiSchema = require("./taxation.schema");
const vehicleValidation = require("../vehicle/vehicle.validation");
const picklistValidation = require("../picklist/picklist.validation");
const taxationValidation = require("./taxation.validation");
const workspaceValidation = require("../workspace/workspace.validation");

// Helpers
const attachmentHelpers = require("../attachment/attachment.helper");

// Constants
const { MODELS } = require("../../common/constants");

// Utilities
const validators = require("../../common/validators");
const removeUploadedFiles = require("../../common/utils/removeUploadedFiles");

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
    validators.isValidDateRange(validatedPayload.startDate, validatedPayload.endDate);

    await workspaceValidation.throwErrorIfWorkspaceDoesNotExist(validatedPayload.workspace);
    await vehicleValidation.throwErrorIfVehicleDoesNotExistsInWorkspace(validatedPayload.vehicle, validatedPayload.workspace);

    if (validatedPayload.jurisdiction) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.jurisdiction);
    }

    validatedPayload.startDate = startOfYear(validatedPayload.startDate);
    validatedPayload.endDate = endOfYear(validatedPayload.endDate);

    if (validatedPayload.filingDate) {
      validators.isValidDateRange(validatedPayload.filingDate);
    }

    const taxation = await taxationRepository.createTaxation(validatedPayload);

    const updatePayload = {};
    if (attachmentPayload?.documents?.length) {
      await attachmentHelpers.buildAttachmentUpdate({
        update: updatePayload,
        field: "documents",
        resource: MODELS.TAXATION,
        resourceId: taxation._id,
        files: attachmentPayload?.documents,
        uploadedBy: attachmentPayload?.uploadedBy,
      });
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

    if (validatedPayload.vehicle && validatedPayload.vehicle !== String(existingTaxation?.vehicle._id)) {
      await vehicleValidation.throwErrorIfVehicleDoesNotExistsInWorkspace(validatedPayload.vehicle, existingTaxation?.workspace?._id);

      updatePayload.vehicle = validatedPayload.vehicle;
    }

    if (validatedPayload.challanNumber && validatedPayload.challanNumber !== existingTaxation?.challanNumber) {
      updatePayload.challanNumber = validatedPayload.challanNumber;
    }

    if (validatedPayload.jurisdiction && validatedPayload.jurisdiction !== String(existingTaxation?.jurisdiction._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.jurisdiction);

      updatePayload.jurisdiction = validatedPayload.jurisdiction;
    }

    const updatedStartDate = validatedPayload.startDate ? startOfYear(new Date(validatedPayload.startDate).getUTCFullYear()) : existingTaxation?.startDate;
    const updatedEndDate = validatedPayload.endDate ? endOfYear(new Date(validatedPayload.endDate).getUTCFullYear()) : existingTaxation?.endDate;

    validators.isValidDateRange(updatedStartDate, updatedEndDate);

    if (validatedPayload.startDate && !validators.isSameDay(validatedPayload.startDate, existingTaxation?.startDate)) {
      updatePayload.startDate = startOfYear(validatedPayload.startDate);
    }

    if (validatedPayload.endDate && !validators.isSameDay(validatedPayload.endDate, existingTaxation?.endDate)) {
      updatePayload.endDate = endOfYear(validatedPayload.endDate);
    }

    if (validatedPayload.filingDate && !validators.isSameDay(validatedPayload.filingDate, existingTaxation?.filingDate)) {
      updatePayload.filingDate = validatedPayload.filingDate;
    }

    if (validatedPayload.amount && validatedPayload.amount !== existingTaxation?.amount) {
      updatePayload.amount = validatedPayload.amount;
    }

    if (validatedPayload.notes && validatedPayload.notes !== existingTaxation?.notes) {
      updatePayload.notes = validatedPayload.notes;
    }

    await attachmentHelpers.buildAttachmentUpdate({
      update: updatePayload,
      field: "documents",
      resource: MODELS.TAXATION,
      resourceId: existingTaxation?._id,
      removedIds: validatedPayload.removedDocuments,
      files: attachmentPayload?.documents,
      uploadedBy: attachmentPayload?.uploadedBy,
      existingIds: (existingTaxation?.documents || []).map((attachment) => String(attachment._id)),
    });

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
