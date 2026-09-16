const lodash = require("lodash");

// Repositories
const picklistRepository = require("./picklist.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./picklist.schema");
const picklistValidation = require("./picklist.validation");

// Helpers
const picklistHelpers = require("./picklist.helper");

// Constants
const { SCOPE } = require("../../constants/PICKLIST");

exports.getAllPicklists = async (filters) => {
  return picklistRepository.getAllPicklists(filters);
};

exports.getPicklistCategories = async () => {
  const picklists = await picklistRepository.getAllPicklists();

  const categories = [
    ...new Map(
      picklists.map((picklist) => {
        const key = picklist.scope === SCOPE.GLOBAL ? picklist.field : `${picklist.resource}.${picklist.field}`;

        return [
          key,
          {
            key,
            scope: picklist.scope,
            resource: picklist.resource ?? null,
            field: picklist.field,
          },
        ];
      }),
    ).values(),
  ];

  return categories;
};

exports.getPicklistsWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [picklists, totalCount] = await Promise.all([
    picklistRepository.getPicklistsWithPagination(filters, offset, pageSize, sort),
    picklistRepository.getPicklistsCount(filters),
  ]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: picklists, meta };
};

exports.getPicklistById = async (picklistId) => {
  joi.validate(picklistId, joiSchema.getPicklistById);

  return picklistValidation.throwErrorIfPicklistDoesNotExist(picklistId);
};

exports.createPicklist = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createPicklist);

  validatedPayload.value = validatedPayload.title.toLowerCase();

  if (validatedPayload.scope === SCOPE.GLOBAL) {
    delete validatedPayload.resource;
  }

  picklistValidation.throwErrorIfResourceOrFieldIsInvalid(validatedPayload.scope, validatedPayload.resource, validatedPayload.field);
  await picklistValidation.throwErrorIfPicklistValueExistsInContext(
    validatedPayload.value,
    validatedPayload.scope,
    validatedPayload.resource,
    validatedPayload.field,
    validatedPayload.parentPicklist,
  );

  if (validatedPayload.acronym) {
    await picklistValidation.throwErrorIfPicklistAcronymExistsInContext(
      validatedPayload.acronym,
      validatedPayload.scope,
      validatedPayload.resource,
      validatedPayload.field,
      validatedPayload.parentPicklist,
    );
  }

  if (validatedPayload.parentPicklist) {
    await picklistValidation.throwErrorIfPicklistDoesNotExistInContext(validatedPayload.parentPicklist, validatedPayload.scope, validatedPayload.resource);
  }

  validatedPayload.isDefault = await picklistHelpers.resolveDefaultPicklistInContext(
    validatedPayload.scope,
    validatedPayload.resource,
    validatedPayload.field,
    validatedPayload.parentPicklist,
    validatedPayload.isDefault,
  );

  return picklistRepository.createPicklist(validatedPayload);
};

exports.updatePicklist = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updatePicklist);

  const existingPicklist = await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.id);

  const updatePayload = {};

  const updatedScope = validatedPayload.scope || existingPicklist.scope;
  const updatedResource = validatedPayload.resource || existingPicklist.resource;
  const updatedField = validatedPayload.field || existingPicklist.field;
  const updatedParentPicklist = validatedPayload.hasOwnProperty("parentPicklist") ? validatedPayload.parentPicklist : (existingPicklist?.parentPicklist?._id?.toString() ?? null);

  const contextChanged =
    updatedScope !== existingPicklist.scope ||
    updatedResource !== existingPicklist.resource ||
    updatedField !== existingPicklist.field ||
    updatedParentPicklist !== existingPicklist.parentPicklist?._id?.toString();

  if (validatedPayload.title && validatedPayload.title !== existingPicklist.title) {
    updatePayload.title = validatedPayload.title;
    updatePayload.value = updatePayload.title.toLowerCase();
  }

  if (validatedPayload.acronym && validatedPayload.acronym !== existingPicklist.acronym) {
    updatePayload.acronym = validatedPayload.acronym;
  }

  if (validatedPayload.hasOwnProperty("preserveTitleFormatting") && validatedPayload.preserveTitleFormatting !== existingPicklist.preserveTitleFormatting) {
    updatePayload.preserveTitleFormatting = validatedPayload.preserveTitleFormatting;
  }

  if (validatedPayload.scope && validatedPayload.scope !== existingPicklist.scope) {
    updatePayload.scope = validatedPayload.scope;

    if (updatePayload.scope === SCOPE.GLOBAL) {
      updatePayload.$unset = { resource: "" };
    }
  }

  if (validatedPayload.resource && validatedPayload.resource !== existingPicklist.resource && updatedScope === SCOPE.RESOURCE) {
    updatePayload.resource = validatedPayload.resource;
  }

  if (validatedPayload.field && validatedPayload.field !== existingPicklist.field) {
    updatePayload.field = validatedPayload.field;
  }

  if ((validatedPayload.hasOwnProperty("parentPicklist") && validatedPayload.parentPicklist !== existingPicklist?.parentPicklist?._id.toString()) || updatePayload.resource) {
    await picklistValidation.throwErrorIfPicklistDoesNotExistInContext(updatedParentPicklist, updatedScope, updatedResource);

    updatePayload.parentPicklist = validatedPayload.parentPicklist;
  }

  if (validatedPayload.color && validatedPayload.color !== existingPicklist.color) {
    updatePayload.color = validatedPayload.color;
  }

  if (validatedPayload.order && validatedPayload.order !== existingPicklist.order) {
    updatePayload.order = validatedPayload.order;
  }

  if (validatedPayload.hasOwnProperty("isActive") && validatedPayload.isActive !== existingPicklist.isActive) {
    updatePayload.isActive = validatedPayload.isActive;
  }

  if ((validatedPayload.hasOwnProperty("isDefault") && validatedPayload.isDefault !== existingPicklist.isDefault) || contextChanged) {
    updatePayload.isDefault = await picklistHelpers.resolveDefaultPicklistInContext(updatedScope, updatedResource, updatedField, updatedParentPicklist, validatedPayload.isDefault);
  }

  if (Object.keys(validatedPayload.meta).length > 0 && !lodash.isEqual(validatedPayload.meta, existingPicklist.meta)) {
    updatePayload.meta = validatedPayload.meta;
  }

  if (updatePayload.value || contextChanged) {
    const updatedValue = updatePayload.value || existingPicklist.value;

    picklistValidation.throwErrorIfResourceOrFieldIsInvalid(updatedScope, updatedResource, updatedField);
    await picklistValidation.throwErrorIfPicklistValueExistsInContext(updatedValue, updatedScope, updatedResource, updatedField, updatedParentPicklist);
  }

  if (updatePayload.acronym || contextChanged) {
    const updatedAcronym = updatePayload.acronym || existingPicklist.acronym;

    await picklistValidation.throwErrorIfPicklistAcronymExistsInContext(updatedAcronym, updatedScope, updatedResource, updatedField, updatedParentPicklist);
  }

  if (!Object.keys(updatePayload).length) return existingPicklist;

  return picklistRepository.updatePicklistById(validatedPayload.id, updatePayload);
};

exports.reorderPicklist = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.reorderPicklist);

  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.draggedPicklistId);
  await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.targetPicklistId);

  if (validatedPayload.targetParentPicklistId) {
    await picklistValidation.throwErrorIfPicklistDoesNotExist(validatedPayload.targetParentPicklistId);
  }

  const { draggedPicklistId, targetPicklistId, targetParentPicklistId } = validatedPayload;

  const filters = { parentPicklist: targetParentPicklistId ?? null };

  const siblings = await picklistRepository.getAllPicklists(filters);

  const dragged = siblings.find((p) => p._id.toString() === draggedPicklistId);
  const target = siblings.find((p) => p._id.toString() === targetPicklistId);

  const filtered = siblings.filter((p) => p._id.toString() !== draggedPicklistId);

  const targetIndex = filtered.findIndex((p) => p._id.toString() === targetPicklistId);

  filtered.splice(targetIndex, 0, dragged);

  // 4. Compute fractional order
  const prev = filtered[targetIndex - 1];
  const next = filtered[targetIndex + 1];

  let newOrder;

  if (!prev && !next) {
    newOrder = 100;
  } else if (!prev) {
    newOrder = next.order / 2;
  } else if (!next) {
    newOrder = prev.order + 100;
  } else {
    newOrder = (prev.order + next.order) / 2;
  }

  // 5. Detect parent change
  const newParent = targetParentPicklistId !== undefined ? targetParentPicklistId : (dragged.parentPicklist ?? null);

  // 6. Apply update (ONLY ONE WRITE)
  const updated = await Picklist.findByIdAndUpdate(
    draggedPicklistId,
    {
      order: newOrder,
      parentPicklist: newParent,
    },
    { new: true },
  );

  return updated;
};

exports.deletePicklist = async (picklistId) => {
  joi.validate(picklistId, joiSchema.getPicklistById);

  await Promise.all([
    picklistValidation.throwErrorIfPicklistDoesNotExist(picklistId),
    picklistValidation.throwErrorIfDefaultPicklistIsBeingDeleted(picklistId),
    picklistValidation.throwErrorIfParentPicklistIsBeingDeleted(picklistId),
    picklistValidation.throwErrorIfPicklistIsAssignedOnResource(picklistId),
  ]);

  await picklistRepository.deletePicklistById(picklistId);

  return { deletedId: picklistId };
};
