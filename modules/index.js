const express = require("express");
const router = express.Router();

// Middlewares
const checkPermissions = require("../middleware/checkPermissions");
const protect = require("../middleware/authMiddleware");
const queryFilters = require("../middleware/queryFilters");

// Constants
const MODELS = require("../constants/MODELS");

const routes = [
  { path: "/attachments", resource: MODELS.ATTACHMENT, route: require("./attachment/attachment.route") },
  { path: "/brands", resource: MODELS.BRAND, route: require("./brand/brand.route") },
  { path: "/companies", resource: MODELS.COMPANY, route: require("./company/company.route") },
  { path: "/fleets", resource: MODELS.FLEET, route: require("./fleet/fleet.route") },
  { path: "/picklists", resource: MODELS.PICKLIST, route: require("./picklist/picklist.route") },
  { path: "/roles", resource: MODELS.ROLE, route: require("./role/role.route") },
  { path: "/users", resource: MODELS.USER, route: require("./user/user.route") },
];

routes.forEach((route) => {
  const middlewares = [protect];

  if (route.resource) {
    middlewares.push(checkPermissions(route.resource));
    middlewares.push(queryFilters(route.resource));
  }

  router.use(route.path, ...middlewares, route.route);
});

router.use("/auth", require("./auth/auth.route"));

module.exports = router;
