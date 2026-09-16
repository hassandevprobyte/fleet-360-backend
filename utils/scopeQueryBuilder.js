const MODELS = require("../constants/MODELS");
const SCOPE = require("../constants/SCOPE");

const QUERY = Object.freeze({
  COMPANY: "company",
  BRAND: "brand",
  USER: "user",
});

const QUERY_BUILDERS = {
  company: (user) => ({ company: user.companyIds }),
  brand: (user) => ({ brand: user.brandIds }),
  user: (user) => ({ user: user._id }),
};

const RESOURCE_SCOPE = {
  [MODELS.BRAND]: {
    [SCOPE.OWN]: QUERY.BRAND,
    [SCOPE.BRAND]: QUERY.BRAND,
    [SCOPE.COMPANY]: QUERY.COMPANY,
  },
  [MODELS.CLIENT]: {
    [SCOPE.OWN]: QUERY.USER,
    [SCOPE.BRAND]: QUERY.BRAND,
    [SCOPE.COMPANY]: QUERY.COMPANY,
  },
  [MODELS.COMPANY]: {
    [SCOPE.OWN]: QUERY.COMPANY,
    [SCOPE.BRAND]: QUERY.COMPANY,
    [SCOPE.COMPANY]: QUERY.COMPANY,
  },
  [MODELS.ORDER]: {
    [SCOPE.OWN]: QUERY.USER,
    [SCOPE.BRAND]: QUERY.BRAND,
    [SCOPE.COMPANY]: QUERY.COMPANY,
  },
  [MODELS.TASK]: {
    [SCOPE.OWN]: ["createdBy", "assignedTo", "assignedBy", "closedBy"],
    [SCOPE.BRAND]: QUERY.BRAND,
    [SCOPE.COMPANY]: QUERY.COMPANY,
  },
  [MODELS.BASECAMP]: {
    [SCOPE.OWN]: QUERY.COMPANY,
    [SCOPE.BRAND]: QUERY.COMPANY,
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
