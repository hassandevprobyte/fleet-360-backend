const Boom = require("@hapi/boom");

// Repositories
const vehicleRepository = require("./vehicle.repository");

// Constants
const { MESSAGE: message } = require("../../common/constants");

exports.throwErrorIfVehicleDoesNotExist = async (vehicleId) => {
  const vehicle = await vehicleRepository.getVehicleById(vehicleId);

  if (!vehicle) {
    throw Boom.notFound(message.error.vehicle.notFound);
  }

  return vehicle;
};

exports.throwErrorIfVehicleLicensePlateExists = async (licensePlate) => {
  const licensePlateExists = await vehicleRepository.getVehicleByLicensePlate(licensePlate);

  if (licensePlateExists) {
    throw Boom.conflict(message.error.vehicle.licensePlateExists);
  }
};

exports.throwErrorIfVehicleDoesNotExistsInWorkspace = async (vehicleId, workspaceId) => {
  const vehicle = await vehicleRepository.getVehicleByIdAndWorkspaceId(vehicleId, workspaceId);

  if (!vehicle) {
    throw Boom.notFound(message.error.vehicle.notFound);
  }

  return vehicle;
};
