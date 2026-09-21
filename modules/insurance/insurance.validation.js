const Boom = require("@hapi/boom");

// Repositories
const insuranceRepository = require("./insurance.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfInsuranceDoesNotExist = async (insuranceId) => {
  const insurance = await insuranceRepository.getInsuranceById(insuranceId);

  if (!insurance) {
    throw Boom.notFound(message.error.insurance.notFound);
  }

  return insurance;
};
