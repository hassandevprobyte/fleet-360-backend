const lodash = require("lodash");

// Services
const attachmentService = require("../attachment/attachment.service");

// Repositories
const fleetRepository = require("./fleet.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./fleet.schema");
const fleetValidation = require("./fleet.validation");
const picklistValidation = require("../picklist/picklist.validation");

// Helpers
const attachmentHelpers = require("../attachment/attachment.helper");
const fleetHelpers = require("./fleet.helper");

// Utilities
const isSameDay = require("../../utils/isSameDay");
const removeUploadedFiles = require("../../utils/removeUploadedFiles");

// Constants
const MODELS = require("../../constants/MODELS");
const ENUMS = require("../../constants/ENUMS");

exports.getAllFleets = async (filters) => {
  return fleetRepository.getAllFleets(filters);
};

exports.getFleetsWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [fleets, totalCount] = await Promise.all([fleetRepository.getFleetsWithPagination(filters, offset, pageSize, sort), fleetRepository.getFleetsCount(filters)]);
  // const transformedFleets = await attachmentHelpers.attachAttachmentsToDocuments(fleets);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: fleets, meta };
};

exports.getFleetById = async (fleetId) => {
  joi.validate(fleetId, joiSchema.getFleetById);

  const fleet = await fleetValidation.throwErrorIfFleetDoesNotExist(fleetId);

  return attachmentHelpers.attachAttachmentsToDocuments(fleet);
};

exports.getFleetsSummaryByGroup = async (payload) => {
  const { filters, primaryGroup, secondaryGroup } = joi.validate(payload, joiSchema.getFleetsSummaryByGroup);

  const fleetsSummary = await fleetRepository.getFleetsSummaryByGroup(filters, primaryGroup, secondaryGroup);

  return fleetHelpers.transformFleetsSummaryByGroup(fleetsSummary, primaryGroup, secondaryGroup);
};

exports.createFleet = async (payload, attachmentPayload) => {
  try {
    const validatedPayload = joi.validate(payload, joiSchema.createFleet);
    validatedPayload.currentOdometer = validatedPayload.initialOdometer;

    await Promise.all([
      fleetValidation.throwErrorIfFleetLicensePlateExists(validatedPayload.licensePlate),
      picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.make),
      picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.model),
      picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type),
      picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.fuelType),
      picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.transmission),
    ]);

    await picklistValidation.throwErrorIfPicklistDoesNotExistInParentPicklist(validatedPayload.model, validatedPayload.make);

    if (validatedPayload.condition) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.condition);
    } else {
      const condition = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.FLEET, "condition");

      validatedPayload.condition = condition._id;
    }

    fleetHelpers.validateFleetStatus({ status: validatedPayload.status, driverDetails: validatedPayload.driverDetails });

    const fleet = await fleetRepository.createFleet(validatedPayload);

    const updatePayload = {};
    if (attachmentPayload?.documents?.length) {
      await attachmentService.addAttachments({
        resource: MODELS.FLEET,
        resourceId: fleet._id,
        files: attachmentPayload.documents,
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.documents = attachmentPayload.documents.map((document) => document.path);
    }

    if (attachmentPayload?.images?.length) {
      await attachmentService.addAttachments({
        resource: MODELS.FLEET,
        resourceId: fleet._id,
        files: attachmentPayload.images,
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.images = attachmentPayload.images.map((image) => image.path);
    }

    if (!Object.keys(updatePayload).length) return fleet;

    return fleetRepository.updateFleetById(fleet._id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.updateFleet = async (payload, attachmentPayload) => {
  try {
    const validatedPayload = joi.validate(payload, joiSchema.updateFleet);
    console.log("Validated Payload => ", validatedPayload);

    const existingFleet = await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.id);
    const updatePayload = {};

    if (validatedPayload.company && validatedPayload.company !== String(existingFleet?.company)) {
      updatePayload.company = validatedPayload.company;
    }

    if (validatedPayload.make && validatedPayload.make !== String(existingFleet?.make._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.make);
      updatePayload.make = validatedPayload.make;
    }

    if (validatedPayload.model && validatedPayload.model !== String(existingFleet?.model._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.model);
      updatePayload.model = validatedPayload.model;
    }

    if (updatePayload.make || updatePayload.model) {
      const updatedModel = validatedPayload.model || String(existingFleet?.model._id);
      const updatedMake = validatedPayload.make || String(existingFleet?.make._id);

      await picklistValidation.throwErrorIfPicklistDoesNotExistInParentPicklist(updatedModel, updatedMake);
    }

    if (validatedPayload.year && validatedPayload.year !== existingFleet.year) {
      updatePayload.year = validatedPayload.year;
    }

    if (validatedPayload.type && validatedPayload.type !== String(existingFleet?.type._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type);
      updatePayload.type = validatedPayload.type;
    }

    if (validatedPayload.fuelType && validatedPayload.fuelType !== String(existingFleet?.fuelType._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.fuelType);
      updatePayload.fuelType = validatedPayload.fuelType;
    }

    if (validatedPayload.transmission && validatedPayload.transmission !== String(existingFleet?.transmission._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.transmission);
      updatePayload.transmission = validatedPayload.transmission;
    }

    if (validatedPayload.status && validatedPayload.status !== existingFleet?.status) {
      updatePayload.status = validatedPayload.status;
    }

    if (validatedPayload.condition && validatedPayload.condition !== String(existingFleet?.condition._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.condition);
      updatePayload.condition = validatedPayload.condition;
    }

    if (validatedPayload.color && validatedPayload.color !== existingFleet.color) {
      updatePayload.color = validatedPayload.color;
    }

    if (validatedPayload.licensePlate && validatedPayload.licensePlate !== existingFleet.licensePlate) {
      await fleetValidation.throwErrorIfFleetLicensePlateExists(validatedPayload.licensePlate);
      updatePayload.licensePlate = validatedPayload.licensePlate;
    }

    if (validatedPayload.purchaseAmount && validatedPayload.purchaseAmount !== existingFleet.purchaseAmount) {
      updatePayload.purchaseAmount = validatedPayload.purchaseAmount;
    }

    if (validatedPayload.purchaseDate && !isSameDay(validatedPayload.purchaseDate, existingFleet.purchaseDate)) {
      updatePayload.purchaseDate = validatedPayload.purchaseDate;
    }

    if (validatedPayload.rent && validatedPayload.rent !== existingFleet.rent) {
      updatePayload.rent = validatedPayload.rent;
    }

    if (validatedPayload.initialOdometer && validatedPayload.initialOdometer !== existingFleet.initialOdometer) {
      updatePayload.initialOdometer = validatedPayload.initialOdometer;
      if (existingFleet.initialOdometer === existingFleet.currentOdometer) {
        updatePayload.currentOdometer = validatedPayload.initialOdometer;
      }
    }

    if (validatedPayload.currentOdometer && validatedPayload.currentOdometer !== existingFleet.currentOdometer) {
      updatePayload.currentOdometer = validatedPayload.currentOdometer;
    }

    if ((validatedPayload.assignedTo && validatedPayload.assignedTo, String(existingFleet?.assignedTo))) {
      updatePayload.assignedTo = validatedPayload.assignedTo;
    }

    if ((validatedPayload.assignedBy && validatedPayload.assignedBy, String(existingFleet?.assignedBy))) {
      updatePayload.assignedBy = validatedPayload.assignedBy;
    }

    if (validatedPayload.assignedOn && !isSameDay(validatedPayload.assignedOn, existingFleet?.assignedOn)) {
      updatePayload.assignedOn = validatedPayload.assignedOn;
    }

    if (validatedPayload.inspector && validatedPayload.inspector !== String(existingFleet?.inspector)) {
      updatePayload.inspector = validatedPayload.inspector;
    }

    const updatedStatus = validatedPayload.status || existingFleet.status;
    const updatedDriverDetails = validatedPayload.driverDetails !== undefined ? validatedPayload.driverDetails : existingFleet.driverDetails;

    fleetHelpers.validateFleetStatus({ status: updatedStatus, driverDetails: updatedDriverDetails });

    if (validatedPayload.driverDetails && !lodash.isEqual(validatedPayload.driverDetails, existingFleet?.driverDetails)) {
      updatePayload.driverDetails = validatedPayload.driverDetails;
    }

    if (validatedPayload.status && validatedPayload.status !== existingFleet.status) {
      updatePayload.status = validatedPayload.status;
    }

    if (attachmentPayload.documents || attachmentPayload.images) {
      await attachmentService.deleteAttachmentsByResource(MODELS.FLEET, existingFleet._id);

      await attachmentService.addAttachments({
        resource: MODELS.FLEET,
        resourceId: existingFleet._id,
        files: [...(attachmentPayload?.documents || []), ...(attachmentPayload?.images || [])],
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.$set = {
        documents: (attachmentPayload.documents || []).map((document) => document.path),
        images: (attachmentPayload.images || []).map((image) => image.path),
      };
    }

    if (!Object.keys(updatePayload).length) return existingFleet;

    return fleetRepository.updateFleetById(validatedPayload.id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.deleteFleet = async (fleetId) => {
  joi.validate(fleetId, joiSchema.getFleetById);

  await fleetValidation.throwErrorIfFleetDoesNotExist(fleetId);
  await attachmentService.deleteAttachmentsByResource(MODELS.FLEET, fleetId);
  await fleetRepository.deleteFleetById(fleetId);

  return { deletedId: fleetId };
};
