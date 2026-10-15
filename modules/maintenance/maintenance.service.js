const lodash = require("lodash");

// Services
const attachmentService = require("../attachment/attachment.service");

// Repositories
const fleetRepository = require("../fleet/fleet.repository");
const maintenanceRepository = require("./maintenance.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./maintenance.schema");
const fleetValidation = require("../fleet/fleet.validation");
const maintenanceValidation = require("./maintenance.validation");
const picklistValidation = require("../picklist/picklist.validation");

// Constants
const MODELS = require("../../constants/MODELS");

// Utilities
const isValidDateRange = require("../../utils/isValidDateRange");
const removeUploadedFiles = require("../../utils/removeUploadedFiles");

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

    const fleet = await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);
    validatedPayload.company = fleet.company;
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
    if (attachmentPayload?.conditionBefore?.length) {
      await attachmentService.addAttachments({
        resource: MODELS.MAINTENANCE,
        resourceId: maintenance._id,
        files: attachmentPayload.conditionBefore,
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.conditionBefore = attachmentPayload.conditionBefore.map((file) => file.path);
    }

    if (attachmentPayload?.conditionAfter?.length) {
      await attachmentService.addAttachments({
        resource: MODELS.MAINTENANCE,
        resourceId: maintenance._id,
        files: attachmentPayload.conditionAfter,
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.conditionAfter = attachmentPayload.conditionAfter.map((file) => file.path);
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

    if (validatedPayload.fleet && validatedPayload.fleet !== String(existingMaintenance?.fleet._id)) {
      await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);
      updatePayload.fleet = validatedPayload.fleet;
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
    isValidDateRange(updatedStartDate, updatedEndDate);

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

    if (attachmentPayload.conditionBefore || attachmentPayload.conditionAfter) {
      await attachmentService.deleteAttachmentsByResource(MODELS.MAINTENANCE, existingMaintenance._id);

      await attachmentService.addAttachments({
        resource: MODELS.MAINTENANCE,
        resourceId: existingMaintenance._id,
        files: [...(attachmentPayload?.conditionBefore || []), ...(attachmentPayload?.conditionAfter || [])],
        uploadedBy: attachmentPayload.uploadedBy,
      });

      updatePayload.$set = {
        conditionBefore: (attachmentPayload.conditionBefore || []).map((image) => image.path),
        conditionAfter: (attachmentPayload.conditionAfter || []).map((image) => image.path),
      };
    }

    if (!Object.keys(updatePayload).length) return existingMaintenance;

    if (updatePayload.odometer || updatePayload.fleet) {
      const fleetId = updatePayload.fleet || String(existingMaintenance?.fleet._id);
      const newOdometer = updatePayload.odometer || existingMaintenance?.odometer;

      await fleetRepository.updateFleetById(fleetId, { currentOdometer: newOdometer });
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
