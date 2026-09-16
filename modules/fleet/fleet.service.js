// Services
const attachmentService = require("../attachment/attachment.service");

// Repositories
const fleetRepository = require("./fleet.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./fleet.schema");
const fleetValidation = require("./fleet.validation");
const companyValidation = require("../company/company.validation");
const picklistValidation = require("../picklist/picklist.validation");
const userValidation = require("../user/user.validation");

// Helpers
const attachmentHelpers = require("../attachment/attachment.helper");
const fleetHelpers = require("./fleet.helper");

// Utilities
const isSameDay = require("../../utils/isSameDay");
const isValidObjectId = require("../../utils/isValidObjectId");

// Constants
const MODELS = require("../../constants/MODELS");

exports.getAllFleets = async (filters) => {
  return fleetRepository.getAllVehicles(filters);
};

exports.getFleetsWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [vehicles, totalCount] = await Promise.all([fleetRepository.getVehiclesWithPagination(filters, offset, pageSize, sort), fleetRepository.getVehiclesCount(filters)]);
  const transformedVehicles = await attachmentHelpers.attachAttachmentsToDocuments(vehicles);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: transformedVehicles, meta };
};

exports.getFleetsSummaryByGroup = async (payload) => {
  const { filters, primaryGroup, secondaryGroup } = joi.validate(payload, joiSchema.getFleetsSummaryByGroup);

  const vehiclesSummary = await fleetRepository.getVehiclesSummaryByGroup(filters, primaryGroup, secondaryGroup);

  return transformVehiclesSummaryByGroup(vehiclesSummary, primaryGroup, secondaryGroup);
};

exports.getVehicleById = async (vehicleId) => {
  joi.validate(vehicleId, joiSchema.getVehicleById);

  const vehicle = await fleetValidation.throwErrorIfVehicleDoesNotExist(vehicleId);

  return attachmentHelpers.attachAttachmentsToDocuments(vehicle);
};

exports.createVehicle = async (payload, attachmentPayload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createVehicle);

  validatedPayload.currentOdometer = validatedPayload.initialOdometer;

  await fleetValidation.throwErrorIfVehicleLicensePlateExists(validatedPayload.licensePlate);
  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.make);
  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.model);
  await picklistValidation.throwErrorIfPicklistDoesNotExistInParentPicklist(validatedPayload.model, validatedPayload.make);
  await companyValidation.throwErrorIfCompanyDoesNotExist(validatedPayload.company);

  if (validatedPayload.status) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);
  } else {
    const status = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.VEHICLE, "status");

    validatedPayload.status = status._id;
  }

  if (validatedPayload.inspector) {
    await userValidation.throwErrorIfUserDoesNotExist(validatedPayload.inspector);
  }

  const vehicle = await fleetRepository.createVehicle(validatedPayload);

  if (attachmentPayload?.files?.length) {
    await attachmentService.addAttachments({
      resource: MODELS.VEHICLE,
      resourceId: vehicle._id,
      files: attachmentPayload.files,
      uploadedBy: attachmentPayload.uploadedBy,
    });
  }

  return vehicle;
};

exports.updateVehicle = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateVehicle);

  const existingVehicle = await fleetValidation.throwErrorIfVehicleDoesNotExist(validatedPayload.id);

  const updatePayload = {};

  if (validatedPayload.make && validatedPayload.make !== existingVehicle.make._id.toString()) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.make);

    updatePayload.make = validatedPayload.make;
  }

  if (validatedPayload.model && validatedPayload.model !== existingVehicle.model._id.toString()) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.model);

    updatePayload.model = validatedPayload.model;
  }

  if (updatePayload.make || updatePayload.model) {
    const updatedModel = validatedPayload.model || existingVehicle.model._id.toString();
    const updatedMake = validatedPayload.make || existingVehicle.make._id.toString();

    await picklistValidation.throwErrorIfPicklistDoesNotExistInParentPicklist(updatedModel, updatedMake);
  }

  if (validatedPayload.status && validatedPayload.status !== existingVehicle.status._id.toString()) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);

    updatePayload.status = validatedPayload.status;
  }

  if (validatedPayload.year && validatedPayload.year !== existingVehicle.year) {
    updatePayload.year = validatedPayload.year;
  }

  if (validatedPayload.color && validatedPayload.color !== existingVehicle.color) {
    updatePayload.color = validatedPayload.color;
  }

  if (validatedPayload.licensePlate && validatedPayload.licensePlate !== existingVehicle.licensePlate) {
    await fleetValidation.throwErrorIfVehicleLicensePlateExists(validatedPayload.licensePlate);

    updatePayload.licensePlate = validatedPayload.licensePlate;
  }

  if (validatedPayload.purchaseAmount && validatedPayload.purchaseAmount !== existingVehicle.purchaseAmount) {
    updatePayload.purchaseAmount = validatedPayload.purchaseAmount;
  }

  if (validatedPayload.purchaseDate && !isSameDay(validatedPayload.purchaseDate, existingVehicle.purchaseDate)) {
    updatePayload.purchaseDate = validatedPayload.purchaseDate;
  }

  if (validatedPayload.rent && validatedPayload.rent !== existingVehicle.rent) {
    updatePayload.rent = validatedPayload.rent;
  }

  if (validatedPayload.company && validatedPayload.company !== existingVehicle?.company?._id?.toString()) {
    await companyValidation.throwErrorIfCompanyDoesNotExist(validatedPayload.company);

    updatePayload.company = validatedPayload.company;
  }

  if (validatedPayload.assignedOn && !isSameDay(validatedPayload.assignedOn, existingVehicle.assignedOn)) {
    updatePayload.assignedOn = validatedPayload.assignedOn;
  }

  if (validatedPayload.inspector && validatedPayload.inspector !== existingVehicle?.inspector?._id.toString()) {
    await userValidation.throwErrorIfUserDoesNotExist(validatedPayload.inspector);

    updatePayload.inspector = validatedPayload.inspector;
  }

  return fleetRepository.updateVehicleById(validatedPayload.id, updatePayload);
};

exports.deleteVehicle = async (vehicleId) => {
  joi.validate(vehicleId, joiSchema.getVehicleById);

  await fleetValidation.throwErrorIfVehicleDoesNotExist(vehicleId);

  await attachmentService.deleteAttachmentsByResource(MODELS.VEHICLE, vehicleId);
  await fleetRepository.deleteVehicleById(vehicleId);

  return { deletedId: vehicleId };
};

async function transformVehiclesSummaryByGroup(vehiclesSummary, primaryGroup, secondaryGroup) {
  const primaryGroupIds = vehiclesSummary.primaryGroupWise
    .map((group) => group?._id)
    .filter((id) => id && isValidObjectId(id))
    .map(String);
  const primaryFilters = { _id: { $in: primaryGroupIds } };

  const secondaryGroupIds = vehiclesSummary.secondaryGroupWise
    .map((group) => group?._id)
    .filter((id) => id && isValidObjectId(id))
    .map(String);
  const secondaryFilters = { _id: { $in: secondaryGroupIds } };

  const [primaryGroupItemsMap, secondaryGroupItemsMap] = await Promise.all([
    fleetHelpers.getGroupListItemsMap(primaryGroup, primaryFilters),
    fleetHelpers.getGroupListItemsMap(secondaryGroup, secondaryFilters),
  ]);

  const transformSecondaryGroupWise = (secondaryGroupWise = []) => {
    const secondaryGroupWiseMap = new Map(secondaryGroupWise.map((s) => [String(s._id), s]));

    return Array.from(secondaryGroupItemsMap.values())
      .map((s) => {
        const secondaryGroupData = secondaryGroupWiseMap.get(String(s._id)) || {};

        const _id = s._id || null;
        const title = s.title || "-";
        const color = s.color || null;
        const count = secondaryGroupData.count || 0;
        const purchaseAmount = secondaryGroupData.purchaseAmount || 0;

        return { _id, title, color, count, purchaseAmount };
      })
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  };

  const transformPrimaryGroupWise = (primaryGroupWise = []) => {
    return primaryGroupWise
      .map((primaryGroup) => {
        const primaryGroupFound = primaryGroupItemsMap.get(String(primaryGroup._id));

        return {
          ...primaryGroup,
          title: primaryGroupFound?.title || "-",
          color: primaryGroupFound?.color || null,
          secondaryGroupWise: transformSecondaryGroupWise(primaryGroup?.secondaryGroupWise),
        };
      })
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  };

  const primaryGroupWise = transformPrimaryGroupWise(vehiclesSummary.primaryGroupWise);
  const secondaryGroupWise = transformSecondaryGroupWise(vehiclesSummary.secondaryGroupWise);

  return { ...vehiclesSummary, primaryGroupWise, secondaryGroupWise };
}
