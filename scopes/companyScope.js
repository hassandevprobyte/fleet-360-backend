const Boom = require("@hapi/boom");

// Validations
const companyValidation = require("../validations/company");

// Constants
const SCOPE = require("../constants/SCOPE");
const message = require("../constants/MESSAGE");

exports.scope = (authUser) => {
  const userScope = authUser.effectiveScope;

  switch (userScope) {
    case SCOPE.OWN:
    case SCOPE.BRAND:
    case SCOPE.COMPANY:
      return { _id: authUser.companyIds };

    case SCOPE.ALL:
      return {};

    default:
      return { _id: authUser.companyIds };
  }
};

exports.authorizeByScope = async (authUser, companyId) => {
  const company = await companyValidation.throwErrorIfCompanyDoesNotExist(companyId);

  const userScope = authUser.effectiveScope;

  switch (userScope) {
    case SCOPE.OWN:
    case SCOPE.BRAND:
    case SCOPE.COMPANY:
      return authUser.companyIds.includes(company._id.toString());

    case SCOPE.ALL:
      return true;

    default:
      throw Boom.unauthorized(message.error.auth.unauthorized);
  }
};
