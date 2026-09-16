const Boom = require("@hapi/boom");

// Repositories
const fleetRepository = require("./fleet.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfFleetDoesNotExist = async (fleetId) => {
  const fleet = await fleetRepository.getFleetById(fleetId);

  if (!fleet) {
    throw Boom.notFound(message.error.fleet.notFound);
  }

  return fleet;
};

exports.throwErrorIfFleetLicensePlateExists = async (licensePlate) => {
  const licensePlateExists = await fleetRepository.getFleetByLicensePlate(licensePlate);

  if (licensePlateExists) {
    throw Boom.conflict(message.error.fleet.licensePlateExists);
  }
};
