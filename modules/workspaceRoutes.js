const express = require("express");
const router = express.Router();

// Middlewares
const checkPermissions = require("../middleware/checkPermissions");
const protect = require("../middleware/authMiddleware");
const queryFilters = require("../middleware/queryFilters");
const requireWorkspaceAccess = require("../middleware/requireWorkspaceAccess");

// Constants
const { MODELS } = require("../common/constants");

const routes = [
  { path: "/", resource: MODELS.WORKSPACE, route: require("./workspace/workspace.route") },
  { path: "/attachments", resource: MODELS.ATTACHMENT, route: require("./attachment/attachment.route") },
  { path: "/depreciations", resource: MODELS.DEPRECIATION, route: require("./depreciation/depreciation.route") },
  { path: "/fleets", resource: MODELS.FLEET, route: require("./fleet/fleet.route") },
  { path: "/insurance", resource: MODELS.INSURANCE, route: require("./insurance/insurance.route") },
  { path: "/maintenance", resource: MODELS.MAINTENANCE, route: require("./maintenance/maintenance.route") },
  { path: "/picklists", resource: MODELS.PICKLIST, route: require("./picklist/picklist.route") },
  { path: "/taxation", resource: MODELS.TAXATION, route: require("./taxation/taxation.route") },
  { path: "/roles", resource: MODELS.ROLE, route: require("./role/role.route") },
  { path: "/users", resource: MODELS.USER, route: require("./user/user.route") },
];

routes.forEach((route) => {
  const middlewares = [protect, requireWorkspaceAccess];

  if (route.resource) {
    middlewares.push(checkPermissions(route.resource));
    middlewares.push(queryFilters(route.resource));
  }

  router.use(route.path, ...middlewares, route.route);
});

module.exports = router;
