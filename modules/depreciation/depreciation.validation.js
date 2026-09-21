const Boom = require("@hapi/boom");

// Repositories
const depreciationRepository = require("./depreciation.repository");

// Constants
const message = require("../../constants/MESSAGE");

exports.throwErrorIfDepreciationDoesNotExist = async (depreciationId) => {
  const depreciation = await depreciationRepository.getDepreciationById(depreciationId);

  if (!depreciation) {
    throw Boom.notFound(message.error.depreciation.notFound);
  }

  return depreciation;
};

exports.throwErrorIfDepreciationFleetExists = async (assetId) => {
  const depreciation = await depreciationRepository.getDepreciationByFleetId(assetId);

  if (depreciation) {
    throw Boom.notFound(message.error.depreciation.alreadyExists);
  }

  return true;
};
