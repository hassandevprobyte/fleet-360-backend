const Boom = require("@hapi/boom");

// Repositories
const maintenanceRepository = require("./maintenance.repository");

// Constants
const { MESSAGE: message } = require("../../common/constants");

exports.throwErrorIfMaintenanceDoesNotExist = async (maintenanceId) => {
  const maintenance = await maintenanceRepository.getMaintenanceById(maintenanceId);

  if (!maintenance) {
    throw Boom.notFound(message.error.maintenance.notFound);
  }

  return maintenance;
};
