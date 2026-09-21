const Boom = require("@hapi/boom");

// Repositories
const taxationRepository = require("./taxation.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfTaxationDoesNotExist = async (taxationId) => {
  const taxation = await taxationRepository.getTaxationById(taxationId);

  if (!taxation) {
    throw Boom.notFound(message.error.taxation.notFound);
  }

  return taxation;
};
