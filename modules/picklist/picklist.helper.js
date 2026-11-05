const Boom = require("@hapi/boom");

// Repositories
const picklistRepository = require("./picklist.repository");

const { PICKLIST } = require("../../common/constants");

exports.resolveContext = ({ scope, resource, field, parentPicklist = null }) => {
  const base = { scope, field, parentPicklist };

  if (scope === PICKLIST.SCOPE.RESOURCE) {
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
