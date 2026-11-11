const lodash = require("lodash");

// Services
const attachmentService = require("../attachment/attachment.service");

// Repositories
const vehicleRepository = require("./vehicle.repository");
const depreciationRepository = require("../depreciation/depreciation.repository");
const maintenanceRepository = require("../maintenance/maintenance.repository");

// Validations
const joi = require("../../config/joi");
const joiSchema = require("./vehicle.schema");
const vehicleValidation = require("./vehicle.validation");
const picklistValidation = require("../picklist/picklist.validation");
const workspaceValidation = require("../workspace/workspace.validation");

// Helpers
const attachmentHelpers = require("../attachment/attachment.helper");
const vehicleHelpers = require("./vehicle.helper");

// Utilities
const excel = require("../../common/utils/excel");
const formatters = require("../../common/formatters");
const validators = require("../../common/validators");
const removeUploadedFiles = require("../../common/utils/removeUploadedFiles");

// Constants
const { MODELS } = require("../../common/constants");

exports.getAllVehicles = async (filters) => {
  return vehicleRepository.getAllVehicles(filters);
};

exports.getVehiclesWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [vehicles, totalCount] = await Promise.all([vehicleRepository.getVehiclesWithPagination(filters, offset, pageSize, sort), vehicleRepository.getVehiclesCount(filters)]);
  // const transformedVehicles = await attachmentHelpers.attachAttachmentsToDocuments(vehicles);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: vehicles, meta };
};

exports.getVehicleById = async (vehicleId) => {
  joi.validate(vehicleId, joiSchema.getVehicleById);

  const vehicle = await vehicleValidation.throwErrorIfVehicleDoesNotExist(vehicleId);

  return attachmentHelpers.attachAttachmentsToDocuments(vehicle);
};

exports.createVehicle = async (payload, attachmentPayload) => {
  try {
    const validatedPayload = joi.validate(payload, joiSchema.createVehicle);
    validatedPayload.currentOdometer = validatedPayload.initialOdometer;

    await Promise.all([
      workspaceValidation.throwErrorIfWorkspaceDoesNotExist(validatedPayload.workspace),
      vehicleValidation.throwErrorIfVehicleLicensePlateExists(validatedPayload.licensePlate),
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
      const condition = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.VEHICLE, "condition");

      validatedPayload.condition = condition._id;
    }

    vehicleHelpers.validateVehicleStatus({ status: validatedPayload.status, driverDetails: validatedPayload.driverDetails });

    const vehicle = await vehicleRepository.createVehicle(validatedPayload);

    const updatePayload = {};
    const attachmentTypes = ["documents", "images"];

    for (const attachmentType of attachmentTypes) {
      if (attachmentPayload?.[attachmentType]?.length) {
        await attachmentHelpers.buildAttachmentUpdate({
          update: updatePayload,
          field: attachmentType,
          resource: MODELS.VEHICLE,
          resourceId: vehicle._id,
          files: attachmentPayload[attachmentType],
          uploadedBy: attachmentPayload.uploadedBy,
        });
      }
    }

    if (!Object.keys(updatePayload).length) return vehicle;

    return vehicleRepository.updateVehicleById(vehicle._id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.updateVehicle = async (payload, attachmentPayload) => {
  try {
    const validatedPayload = joi.validate(payload, joiSchema.updateVehicle);

    const existingVehicle = await vehicleValidation.throwErrorIfVehicleDoesNotExist(validatedPayload.id);
    const updatePayload = {};

    if (validatedPayload.make && validatedPayload.make !== String(existingVehicle?.make._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.make);
      updatePayload.make = validatedPayload.make;
    }

    if (validatedPayload.model && validatedPayload.model !== String(existingVehicle?.model._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.model);
      updatePayload.model = validatedPayload.model;
    }

    if (updatePayload.make || updatePayload.model) {
      const updatedModel = validatedPayload.model || String(existingVehicle?.model._id);
      const updatedMake = validatedPayload.make || String(existingVehicle?.make._id);

      await picklistValidation.throwErrorIfPicklistDoesNotExistInParentPicklist(updatedModel, updatedMake);
    }

    if (validatedPayload.year && validatedPayload.year !== existingVehicle.year) {
      updatePayload.year = validatedPayload.year;
    }

    if (validatedPayload.type && validatedPayload.type !== String(existingVehicle?.type._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type);
      updatePayload.type = validatedPayload.type;
    }

    if (validatedPayload.fuelType && validatedPayload.fuelType !== String(existingVehicle?.fuelType._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.fuelType);
      updatePayload.fuelType = validatedPayload.fuelType;
    }

    if (validatedPayload.transmission && validatedPayload.transmission !== String(existingVehicle?.transmission._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.transmission);
      updatePayload.transmission = validatedPayload.transmission;
    }

    if (validatedPayload.status && validatedPayload.status !== existingVehicle?.status) {
      updatePayload.status = validatedPayload.status;
    }

    if (validatedPayload.condition && validatedPayload.condition !== String(existingVehicle?.condition._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.condition);
      updatePayload.condition = validatedPayload.condition;
    }

    if (validatedPayload.color && validatedPayload.color !== existingVehicle.color) {
      updatePayload.color = validatedPayload.color;
    }

    if (validatedPayload.licensePlate && validatedPayload.licensePlate !== existingVehicle.licensePlate) {
      await vehicleValidation.throwErrorIfVehicleLicensePlateExists(validatedPayload.licensePlate);
      updatePayload.licensePlate = validatedPayload.licensePlate;
    }

    if (validatedPayload.purchaseAmount && validatedPayload.purchaseAmount !== existingVehicle.purchaseAmount) {
      updatePayload.purchaseAmount = validatedPayload.purchaseAmount;
    }

    if (validatedPayload.purchaseDate && !validators.isSameDay(validatedPayload.purchaseDate, existingVehicle.purchaseDate)) {
      updatePayload.purchaseDate = validatedPayload.purchaseDate;
    }

    if (validatedPayload.rent && validatedPayload.rent !== existingVehicle.rent) {
      updatePayload.rent = validatedPayload.rent;
    }

    if (validatedPayload.initialOdometer && validatedPayload.initialOdometer !== existingVehicle.initialOdometer) {
      updatePayload.initialOdometer = validatedPayload.initialOdometer;
      if (existingVehicle.initialOdometer === existingVehicle.currentOdometer) {
        updatePayload.currentOdometer = validatedPayload.initialOdometer;
      }
    }

    if (validatedPayload.currentOdometer && validatedPayload.currentOdometer !== existingVehicle.currentOdometer) {
      updatePayload.currentOdometer = validatedPayload.currentOdometer;
    }

    if ((validatedPayload.assignedTo && validatedPayload.assignedTo, String(existingVehicle?.assignedTo))) {
      updatePayload.assignedTo = validatedPayload.assignedTo;
    }

    if ((validatedPayload.assignedBy && validatedPayload.assignedBy, String(existingVehicle?.assignedBy))) {
      updatePayload.assignedBy = validatedPayload.assignedBy;
    }

    if (validatedPayload.assignedOn && !validators.isSameDay(validatedPayload.assignedOn, existingVehicle?.assignedOn)) {
      updatePayload.assignedOn = validatedPayload.assignedOn;
    }

    if (validatedPayload.inspector && validatedPayload.inspector !== String(existingVehicle?.inspector)) {
      updatePayload.inspector = validatedPayload.inspector;
    }

    const updatedStatus = validatedPayload.status || existingVehicle.status;
    const updatedDriverDetails = validatedPayload.driverDetails !== undefined ? validatedPayload.driverDetails : existingVehicle.driverDetails;

    vehicleHelpers.validateVehicleStatus({ status: updatedStatus, driverDetails: updatedDriverDetails });

    if (validatedPayload.driverDetails && !lodash.isEqual(validatedPayload.driverDetails, existingVehicle?.driverDetails)) {
      updatePayload.driverDetails = validatedPayload.driverDetails;
    }

    if (validatedPayload.status && validatedPayload.status !== existingVehicle.status) {
      updatePayload.status = validatedPayload.status;
    }

    const updatedAttachments = [
      {
        field: "documents",
        removeLabel: "removedDocuments",
      },
      {
        field: "images",
        removeLabel: "removedImages",
      },
    ];

    for (const attachment of updatedAttachments) {
      const updatedFiles = attachmentPayload[attachment.field] || [];
      const existingFiles = existingVehicle[attachment.field] || [];

      await attachmentHelpers.buildAttachmentUpdate({
        update: updatePayload,
        field: attachment.field,
        resource: MODELS.VEHICLE,
        resourceId: existingVehicle?._id,
        removedIds: validatedPayload[attachment.removeLabel],
        files: updatedFiles,
        uploadedBy: attachmentPayload?.uploadedBy,
        existingIds: existingFiles.map((attachment) => String(attachment._id)),
      });
    }

    if (!Object.keys(updatePayload).length) return existingVehicle;

    return vehicleRepository.updateVehicleById(validatedPayload.id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.deleteVehicle = async (vehicleId) => {
  joi.validate(vehicleId, joiSchema.getVehicleById);

  await vehicleValidation.throwErrorIfVehicleDoesNotExist(vehicleId);

  await Promise.all([
    attachmentService.deleteAttachmentsByResource(MODELS.VEHICLE, vehicleId),
    depreciationRepository.deleteDepreciationByVehicleId(vehicleId),
    maintenanceRepository.deleteMaintenanceByVehicleId(vehicleId),
  ]);

  await vehicleRepository.deleteVehicleById(vehicleId);

  return { deletedId: vehicleId };
};

exports.exportVehicles = async (filters, stream) => {
  const assets = await vehicleRepository.getAllVehicles(filters);

  const columns = [
    { header: "Purchase Date", key: "purchaseDate" },
    { header: "User", key: "user" },
    { header: "Make", key: "make" },
    { header: "Model", key: "model" },
    { header: "Year", key: "year" },
    { header: "Type", key: "type" },
    { header: "Fuel Type", key: "fuelType" },
    { header: "transmission", key: "transmission" },
    { header: "color", key: "color" },
    { header: "Purchase Amount", key: "purchaseAmount" },
    { header: "License Plate", key: "licensePlate" },
    { header: "Status", key: "status" },
    { header: "Rent", key: "rent" },
    { header: "Initial Odometer", key: "initialOdometer" },
    { header: "Current Odometer", key: "currentOdometer" },
    { header: "Condition", key: "condition" },
  ];

  const rows = assets.map((vehicle) => ({
    purchaseDate: formatters.formatDate(vehicle.purchaseDate),
    user: lodash.startCase(vehicle.driverDetails.user.name ?? ""),
    make: lodash.startCase(vehicle.make?.title ?? ""),
    model: lodash.startCase(vehicle.model?.title ?? ""),
    year: lodash.startCase(vehicle.year ?? ""),
    type: lodash.startCase(vehicle.type?.title ?? ""),
    fuelType: lodash.startCase(vehicle.fuelType?.title ?? ""),
    transmission: lodash.startCase(vehicle.transmission?.title ?? ""),
    color: lodash.startCase(vehicle.color ?? ""),
    purchaseAmount: vehicle.purchaseAmount ? formatters.formatAmount(vehicle.purchaseAmount, "en-PK", { currency: "PKR" }) : null,
    licensePlate: lodash.startCase(vehicle.licensePlate ?? ""),
    status: lodash.startCase(vehicle.status ?? ""),
    rent: vehicle.rent ? formatters.formatAmount(vehicle.rent, "en-PK", { currency: "PKR" }) : null,
    initialOdometer: vehicle.initialOdometer ?? "-",
    currentOdometer: vehicle.currentOdometer ?? "-",
    condition: lodash.startCase(vehicle.condition?.title ?? ""),
  }));

  await excel.export({ stream, sheetName: "Vehicles", columns, rows });
};
