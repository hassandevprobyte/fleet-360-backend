/**
 * Filters an input payload based on the user's allowed fields for a resource.
 *
 * @param {string} resource - The resource name
 * @param {Object} payload - The input payload to filter
 * @param {Object} authUser - The authenticated user object
 * @param {string[]} additionalAllowedFields - Extra fields to allow beyond permissions
 * @returns {Object} - Filtered payload containing only allowed fields (plus `id`)
 */
const getFilteredPayloadByUserPermissions = (resource = "", payload = {}, authUser, additionalAllowedFields = []) => {
  const permission = authUser.effectivePermissions.find((p) => p.resource.toLowerCase() === resource.toLowerCase());
  const allowedFields = new Set([...permission.allowedUpdateFields, ...additionalAllowedFields]);

  if (!permission) {
    return payload.id ? { id: payload.id } : {};
  }

  const filteredPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => allowedFields.has(key)));

  if (payload.id) {
    filteredPayload.id = payload.id;
  }

  return filteredPayload;
};

module.exports = getFilteredPayloadByUserPermissions;
