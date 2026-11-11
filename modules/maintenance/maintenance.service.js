const lodash = require("lodash");

// Services
const attachmentService = require("../attachment/attachment.service");

// Repositories
const vehicleRepository = require("../vehicle/vehicle.repository");
const maintenanceRepository = require("./maintenance.repository");

// Validations
const joi = require("../../config/joi");
const joiSchema = require("./maintenance.schema");
const vehicleValidation = require("../vehicle/vehicle.validation");
const maintenanceValidation = require("./maintenance.validation");
const picklistValidation = require("../picklist/picklist.validation");
const workspaceValidation = require("../workspace/workspace.validation");

// Helpers
const attachmentHelpers = require("../attachment/attachment.helper");

// Constants
const { MODELS } = require("../../common/constants");

// Utilities
const validators = require("../../common/validators");
const removeUploadedFiles = require("../../common/utils/removeUploadedFiles");

exports.getAllMaintenance = async (filters) => {
  return maintenanceRepository.getAllMaintenance(filters);
};

exports.getMaintenanceWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [maintenances, totalCount] = await Promise.all([
    maintenanceRepository.getMaintenanceWithPagination(filters, offset, pageSize, sort),
    maintenanceRepository.getMaintenanceCount(filters),
  ]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };
  return { data: maintenances, meta };
};

exports.getMaintenanceById = async (maintenanceId) => {
  joi.validate(maintenanceId, joiSchema.getMaintenanceById);

  return maintenanceValidation.throwErrorIfMaintenanceDoesNotExist(maintenanceId);
};

exports.createMaintenance = async (payload, attachmentPayload) => {
  try {
    const validatedPayload = joi.validate(payload, joiSchema.createMaintenance);

    await workspaceValidation.throwErrorIfWorkspaceDoesNotExist(validatedPayload.workspace);
    await vehicleValidation.throwErrorIfVehicleDoesNotExistsInWorkspace(validatedPayload.vehicle, validatedPayload.workspace);
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type);
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.vendor);

    if (validatedPayload.priority) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.priority);
    } else {
      const priority = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "priority");

      validatedPayload.priority = priority._id;
    }

    if (validatedPayload.checklist?.length) {
      for (const c of validatedPayload.checklist) {
        await picklistValidation.throwErrorIfPicklistDoesNotExist(c.item);

        if (c.condition) {
          await picklistValidation.throwErrorIfPicklistDoesNotExist(c.condition);
        } else {
          const condition = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "checklist.condition");
          c.condition = condition._id;
        }
      }
    }

    const maintenance = await maintenanceRepository.createMaintenance(validatedPayload);

    const updatePayload = {};
    const attachmentTypes = ["beforeImages", "afterImages"];

    for (const attachmentType of attachmentTypes) {
      if (attachmentPayload?.[attachmentType]?.length) {
        await attachmentHelpers.buildAttachmentUpdate({
          update: updatePayload,
          field: attachmentType,
          resource: MODELS.MAINTENANCE,
          resourceId: maintenance._id,
          files: attachmentPayload[attachmentType],
          uploadedBy: attachmentPayload.uploadedBy,
        });
      }
    }

    if (!Object.keys(updatePayload).length) return maintenance;

    return maintenanceRepository.updateMaintenanceById(maintenance._id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.updateMaintenance = async (payload, attachmentPayload) => {
  try {
    const validatedPayload = joi.validate(payload, joiSchema.updateMaintenance);

    const existingMaintenance = await maintenanceValidation.throwErrorIfMaintenanceDoesNotExist(validatedPayload.id);
    const updatePayload = {};

    if (validatedPayload.vehicle && validatedPayload.vehicle !== String(existingMaintenance?.vehicle._id)) {
      await vehicleValidation.throwErrorIfVehicleDoesNotExistsInWorkspace(validatedPayload.vehicle, existingMaintenance?.workspace?._id);
      updatePayload.vehicle = validatedPayload.vehicle;
    }

    if (validatedPayload.type && validatedPayload.type !== String(existingMaintenance?.type._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type);
      updatePayload.type = validatedPayload.type;
    }

    if (validatedPayload.priority && validatedPayload.priority !== String(existingMaintenance?.priority._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.priority);
      updatePayload.priority = validatedPayload.priority;
    }

    if (validatedPayload.vendor && validatedPayload.vendor !== String(existingMaintenance?.vendor._id)) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.vendor);

      updatePayload.vendor = validatedPayload.vendor;
    }

    if (validatedPayload.status && validatedPayload.status !== existingMaintenance?.status) {
      updatePayload.status = validatedPayload.status;
    }

    if (validatedPayload.startDate && validatedPayload.startDate !== existingMaintenance?.startDate) {
      updatePayload.startDate = validatedPayload.startDate;
    }

    if (validatedPayload.endDate && validatedPayload.endDate !== existingMaintenance?.endDate) {
      updatePayload.endDate = validatedPayload.endDate;
    }

    const updatedStartDate = validatedPayload.startDate || existingMaintenance?.startDate;
    const updatedEndDate = validatedPayload.endDate || existingMaintenance?.endDate;
    validators.isValidDateRange(updatedStartDate, updatedEndDate);

    if (validatedPayload.odometer && validatedPayload.odometer !== existingMaintenance?.odometer) {
      updatePayload.odometer = validatedPayload.odometer;
    }

    if (validatedPayload.cost && validatedPayload.cost !== existingMaintenance?.cost) {
      updatePayload.cost = validatedPayload.cost;
    }

    if (validatedPayload.notes && validatedPayload.notes !== existingMaintenance?.notes) {
      updatePayload.notes = validatedPayload.notes;
    }

    if (validatedPayload.checklist && !lodash.isEqual(validatedPayload.checklist, existingMaintenance?.checklist)) {
      for (const c of validatedPayload.checklist) {
        await picklistValidation.throwErrorIfPicklistDoesNotExist(c.item);

        if (c.condition) {
          await picklistValidation.throwErrorIfPicklistDoesNotExist(c.condition);
        } else {
          const condition = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "checklist.condition");
          c.condition = condition._id;
        }
      }

      updatePayload.checklist = validatedPayload.checklist;
    }

    const updatedAttachments = [
      {
        field: "beforeImages",
        removeLabel: "removedBeforeImages",
      },
      {
        field: "afterImages",
        removeLabel: "removedAfterImages",
      },
    ];

    for (const attachment of updatedAttachments) {
      const updatedFiles = attachmentPayload[attachment.field] || [];
      const existingFiles = existingMaintenance[attachment.field] || [];

      await attachmentHelpers.buildAttachmentUpdate({
        update: updatePayload,
        field: attachment.field,
        resource: MODELS.MAINTENANCE,
        resourceId: existingMaintenance?._id,
        removedIds: validatedPayload[attachment.removeLabel],
        files: updatedFiles,
        uploadedBy: attachmentPayload?.uploadedBy,
        existingIds: existingFiles.map((attachment) => String(attachment._id)),
      });
    }

    if (!Object.keys(updatePayload).length) return existingMaintenance;

    if (updatePayload.odometer || updatePayload.vehicle) {
      const vehicleId = updatePayload.vehicle || String(existingMaintenance?.vehicle._id);
      const newOdometer = updatePayload.odometer || existingMaintenance?.odometer;

      await vehicleRepository.updateVehicleById(vehicleId, { currentOdometer: newOdometer });
    }

    return maintenanceRepository.updateMaintenanceById(validatedPayload.id, updatePayload);
  } catch (error) {
    await removeUploadedFiles({ files: attachmentPayload });
    throw error;
  }
};

exports.deleteMaintenance = async (maintenanceId) => {
  joi.validate(maintenanceId, joiSchema.getMaintenanceById);

  await maintenanceValidation.throwErrorIfMaintenanceDoesNotExist(maintenanceId);
  await attachmentService.deleteAttachmentsByResource(MODELS.MAINTENANCE, maintenanceId);
  await maintenanceRepository.deleteMaintenanceById(maintenanceId);

  return { deletedId: maintenanceId };
};
