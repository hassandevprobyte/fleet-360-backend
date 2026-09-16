const Boom = require("@hapi/boom");

// Validations
const userValidation = require("./user.validation");

// Constants
const SCOPE = require("../../constants/SCOPE");
const message = require("../../constants/MESSAGE");

const normalizeToArray = (value) => {
  if (!value) return [];

  return Array.isArray(value) ? value.map(String) : [String(value)]; // TODO: replace this with created utility but be careful as its being converted to string
};

exports.scope = (authUser, queryRoles) => {
  const userScope = authUser.effectiveScope;
  const requestedRoles = normalizeToArray(queryRoles);
  const hasMatchingRole = requestedRoles.some((roleId) => authUser.roleIds.includes(roleId));

  switch (userScope) {
    case SCOPE.OWN:
      if (hasMatchingRole) {
        return { _id: authUser._id };
      }

      return { brands: authUser.brandIds };

    case SCOPE.BRAND:
      return { brands: authUser.brandIds };

    case SCOPE.COMPANY:
      return { companies: authUser.companyIds };

    case SCOPE.ALL:
      return {};

    default:
      return { _id: authUser._id };
  }
};

exports.authorizeByScope = async (authUser, userId) => {
  const user = await userValidation.throwErrorIfUserDoesNotExist(userId);

  const userScope = authUser.effectiveScope;

  switch (userScope) {
    case SCOPE.OWN:
      return authUser.id.toString() === user._id.toString();

    case SCOPE.BRAND:
      return authUser.brandIds.some((brandId) => user.brands.map((b) => String(b._id)).includes(brandId));

    case SCOPE.COMPANY:
      return authUser.companyIds.some((companyId) => user.companies.map((c) => String(c._id)).includes(companyId));

    case SCOPE.ALL:
      return true;

    default:
      throw Boom.unauthorized(message.error.auth.unauthorized);
  }
};
