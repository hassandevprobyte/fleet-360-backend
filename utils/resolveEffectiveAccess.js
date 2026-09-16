const SCOPE = require("../constants/SCOPE");
const SCOPE_PRIORITY = require("../constants/SCOPE_PRIORITY");

function resolveEffectiveAccess(roles = []) {
  if (!roles.length) {
    return {
      effectiveRole: null,
      effectiveScope: SCOPE.OWN,
      indexPath: "/",
      effectivePermissions: [],
    };
  }

  let highestRole = roles[0];

  const permissionMap = new Map();

  for (const role of roles) {
    if (SCOPE_PRIORITY[role.scope] > SCOPE_PRIORITY[highestRole.scope]) {
      highestRole = role;
    }

    for (const p of role.permissions || []) {
      const resource = p.resource;

      if (!permissionMap.has(resource)) {
        permissionMap.set(resource, {
          resource,
          actions: new Set(),
          allowedUpdateFields: new Set(),
        });
      }

      const entry = permissionMap.get(resource);

      p.actions?.forEach((a) => entry.actions.add(a));
      p.allowedUpdateFields?.forEach((f) => entry.allowedUpdateFields.add(f));
    }
  }

  const effectivePermissions = [...permissionMap.values()].map((p) => ({
    resource: p.resource,
    actions: [...p.actions],
    allowedUpdateFields: [...p.allowedUpdateFields],
  }));

  return {
    effectiveRole: highestRole,
    effectiveScope: highestRole.scope,
    indexPath: highestRole.indexPath || "/",
    effectivePermissions,
  };
}

module.exports = resolveEffectiveAccess;
