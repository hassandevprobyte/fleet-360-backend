const SCOPE = Object.freeze({
  RESOURCE: "resource",
  GLOBAL: "global",
});

const CONFIG = Object.freeze({
  [SCOPE.GLOBAL]: {
    allowedFields: Object.freeze([]),
    allowedResources: Object.freeze([]),
  },
});

module.exports = { SCOPE, CONFIG };
