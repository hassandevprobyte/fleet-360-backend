const Boom = require("@hapi/boom");

// Validations
const brandValidation = require("./brand.validation");

// Constants
const SCOPE = require("../../constants/SCOPE");
const message = require("../../constants/MESSAGE");

exports.scope = (authUser) => {
  const userScope = authUser.effectiveScope;

  switch (userScope) {
    case SCOPE.OWN:
    case SCOPE.BRAND:
      return { _id: authUser.brandIds };

    case SCOPE.COMPANY:
      return { company: authUser.companyIds };

    case SCOPE.ALL:
      return {};

    default:
      return { _id: authUser.brandIds };
  }
};

exports.authorizeByScope = async (authUser, brandId) => {
  const brand = await brandValidation.throwErrorIfBrandDoesNotExist(brandId);

  const userScope = authUser.effectiveScope;

  switch (userScope) {
    case SCOPE.OWN:
    case SCOPE.BRAND:
      return authUser.brandIds.includes(brand._id.toString());

    case SCOPE.COMPANY:
      return authUser.companyIds.includes(brand.company._id.toString());

    case SCOPE.ALL:
      return true;

    default:
      throw Boom.unauthorized(message.error.auth.unauthorized);
  }
};
