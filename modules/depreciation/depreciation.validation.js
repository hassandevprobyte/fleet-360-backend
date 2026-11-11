const Boom = require("@hapi/boom");

// Repositories
const depreciationRepository = require("./depreciation.repository");

// Constants
const { MESSAGE: message } = require("../../common/constants");

exports.throwErrorIfDepreciationDoesNotExist = async (depreciationId) => {
  const depreciation = await depreciationRepository.getDepreciationById(depreciationId);

  if (!depreciation) {
    throw Boom.notFound(message.error.depreciation.notFound);
  }

  return depreciation;
};

exports.throwErrorIfDepreciationVehicleExists = async (assetId) => {
  const depreciation = await depreciationRepository.getDepreciationByVehicleId(assetId);

  if (depreciation) {
    throw Boom.notFound(message.error.depreciation.alreadyExists);
  }

  return true;
};
