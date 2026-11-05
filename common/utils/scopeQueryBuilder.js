const { MODELS, SCOPE } = require("../constants");

const QUERY = Object.freeze({
  USER: "user",
  BRAND: "brand",
  COMPANY: "company",
});

const QUERY_BUILDERS = {
  user: (user) => ({ user: user._id }),
};

const RESOURCE_SCOPE = {
  [MODELS.ORDER]: {
    [SCOPE.OWN]: QUERY.USER,
    [SCOPE.BRAND]: QUERY.BRAND,
    [SCOPE.COMPANY]: QUERY.COMPANY,
  },
};

// TODO: cater Brand, Company, User in the end
const scopeQueryBuilder = (resource, authUser) => {
  const scope = authUser.effectiveScope;

  if (scope === SCOPE.ALL) {
    return {};
  }

  const config = RESOURCE_SCOPE[resource];

  if (!config) {
    return {};
  }

  const rule = config[scope];

  if (Array.isArray(rule)) {
    return { $or: rule.map((field) => ({ [field]: authUser._id })) };
  }

  return QUERY_BUILDERS[rule](authUser);
};

module.exports = scopeQueryBuilder;
