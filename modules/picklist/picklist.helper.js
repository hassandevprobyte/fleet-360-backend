const Boom = require("@hapi/boom");

// Repositories
const picklistRepository = require("./picklist.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.resolveContext = ({ scope, resource, field, parentPicklist = null }) => {
  const base = { scope, field, parentPicklist };

  if (scope === SCOPE.RESOURCE) {
    base.resource = resource;
  }

  return base;
};

exports.resolveDefaultPicklistInContext = async (scope, resource, field, parentPicklist, requestedDefault) => {
  if (requestedDefault) {
    await picklistRepository.clearDefaultsInContext(scope, resource, field, parentPicklist);

    return true;
  }

  return false;
};
