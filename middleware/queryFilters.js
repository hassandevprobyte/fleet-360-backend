// Utilities
const scopeQueryBuilder = require("../utils/scopeQueryBuilder");
const transformQueryParams = require("../utils/transformQueryToMongooseSyntax");

const orFilters = {
  leadInfo: (value) => [{ title: { $regex: value, $options: "i" } }, { email: { $regex: value, $options: "i" } }, { phone: { $regex: value, $options: "i" } }],
  clientInfo: (value) => [{ title: { $regex: value, $options: "i" } }, { email: { $regex: value, $options: "i" } }, { phone: { $regex: value, $options: "i" } }],
  keyword: (value) => [{ title: { $regex: value, $options: "i" } }, { content: { $regex: value, $options: "i" } }],
};

const queryFilters = (modelName, extraFields = []) => {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const queryScope = scopeQueryBuilder(modelName, req.user);

    const filters = transformQueryParams(
      modelName,
      { ...queryScope, ...(req.query.query || {}) },
      ["$or", "leadInfo", "clientInfo", "orderInfo", "keyword", ...extraFields],
      ["$or", "leadInfo", "clientInfo", "orderInfo", "keyword", "resource", "field"],
    );

    const andConditions = [];

    if (filters.$or) {
      andConditions.push({ $or: filters.$or });

      delete filters.$or;
    }

    Object.entries(orFilters).forEach(([key, builder]) => {
      if (!filters[key]) return;

      andConditions.push({ $or: builder(filters[key]) });

      delete filters[key];
    });

    if (andConditions.length) {
      filters.$and = andConditions;
    }

    req.filters = filters;
    console.dir({ middleware: "queryFilters", queryScope, filters: req.filters }, { depth: null }); // temp
    next();
  };
};

module.exports = queryFilters;
