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
  const validatedPayload = joi.validate(payload, joiSchema.createMaintenance);

  await fleetValidation.throwErrorIfFleetDoesNotExist(validatedPayload.fleet);
  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.type);
  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.provider);

  if (validatedPayload.status) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.status);
  } else {
    const status = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "status");

    validatedPayload.status = status._id;
  }

  if (validatedPayload.priority) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.priority);
  } else {
    const priority = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "priority");

    validatedPayload.priority = priority._id;
  }

  if (validatedPayload.components?.length) {
    await Promise.all(validatedPayload.components.map((component) => picklistValidation.throwErrorIfPicklistDoesNotExist(component.component)));
  }

  if (validatedPayload.checklist?.length) {
    for (const c of validatedPayload.checklist) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(c.item);

      if (c.status) {
        await picklistValidation.throwErrorIfPicklistDoesNotExist(c.status);
      } else {
        const status = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "checklist.status");
        c.status = status._id;
      }

      if (c.condition) {
        await picklistValidation.throwErrorIfPicklistDoesNotExist(c.condition);
      } else {
        const condition = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "checklist.condition");
        c.condition = condition._id;
      }
    }
  }

  const maintenance = await maintenanceRepository.createMaintenance(validatedPayload);

  if (attachmentPayload?.files?.length) {
    await attachmentService.addAttachments({
      resource: MODELS.MAINTENANCE,
      resourceId: maintenance._id,
      files: attachmentPayload.files,
      uploadedBy: attachmentPayload.uploadedBy,
    });
  }

  return maintenance;
};

exports.updateMaintenance = async (payload) => {
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

  if (validatedPayload.reportedBy && validatedPayload.reportedBy !== String(existingMaintenance?.reportedBy)) {
    updatePayload.reportedBy = validatedPayload.reportedBy;
  }

  if (validatedPayload.assignedTo && validatedPayload.assignedTo !== String(existingMaintenance?.assignedTo)) {
    updatePayload.assignedTo = validatedPayload.assignedTo;
  }

  if (validatedPayload.assignedOn && validatedPayload.assignedOn !== String(existingMaintenance?.assignedOn)) {
    updatePayload.assignedOn = validatedPayload.assignedOn;
  }

  if (validatedPayload.provider && validatedPayload.provider !== String(existingMaintenance?.provider._id)) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.provider);

    updatePayload.provider = validatedPayload.provider;
  }

  if (validatedPayload.startedDate && validatedPayload.startedDate !== existingMaintenance?.startedDate) {
    updatePayload.startedDate = validatedPayload.startedDate;
  }

  if (validatedPayload.endDate && validatedPayload.endDate !== existingMaintenance?.endDate) {
    updatePayload.endDate = validatedPayload.endDate;
  }

  const updatedStartDate = validatedPayload.startedDate || existingMaintenance?.startedDate;
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

  if (validatedPayload.components && !lodash.isEqual(validatedPayload.components, existingMaintenance?.components)) {
    await Promise.all(validatedPayload.components.map((component) => picklistValidation.throwErrorIfPicklistDoesNotExist(component.component)));

    updatePayload.components = validatedPayload.components;
  }

  if (validatedPayload.checklist && !lodash.isEqual(validatedPayload.checklist, existingMaintenance?.checklist)) {
    for (const c of validatedPayload.checklist) {
      await picklistValidation.throwErrorIfPicklistDoesNotExist(c.item);

      if (c.status) {
        await picklistValidation.throwErrorIfPicklistDoesNotExist(c.status);
      } else {
        const status = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "checklist.status");
        c.status = status._id;
      }

      if (c.condition) {
        await picklistValidation.throwErrorIfPicklistDoesNotExist(c.condition);
      } else {
        const condition = await picklistValidation.throwErrorIfDefaultPicklistDoesNotExistInContext(MODELS.MAINTENANCE, "checklist.condition");
        c.condition = condition._id;
      }
    }

    updatePayload.checklist = validatedPayload.checklist;
  }

  if (!Object.keys(updatePayload).length) return existingMaintenance;

  if (updatePayload.odometer || updatePayload.fleet) {
    const fleetId = updatePayload.fleet || String(existingMaintenance?.fleet._id);
    const newOdometer = updatePayload.odometer || existingMaintenance?.odometer;

    await fleetRepository.updateFleetById(fleetId, { currentOdometer: newOdometer });
  }

  return maintenanceRepository.updateMaintenanceById(validatedPayload.id, updatePayload);
};

exports.deleteMaintenance = async (maintenanceId) => {
  joi.validate(maintenanceId, joiSchema.getMaintenanceById);

  await maintenanceValidation.throwErrorIfMaintenanceDoesNotExist(maintenanceId);

  await maintenanceRepository.deleteMaintenanceById(maintenanceId);

  return { deletedId: maintenanceId };
};
