const express = require("express");
const router = express.Router();

// Middlewares
const protect = require("../middleware/authMiddleware");
const queryFilters = require("../middleware/queryFilters");
const requireSuperAdminAccess = require("../middleware/requireSuperAdminAccess");

// Constants
const { MODELS } = require("../common/constants");

const routes = [
  { path: "/attachments", resource: MODELS.ATTACHMENT, route: require("./attachment/attachment.route") },
  { path: "/users", resource: MODELS.USER, route: require("./user/user.route") },
  { path: "/workspaces", resource: MODELS.WORKSPACE, route: require("./workspace/workspace.route") },
  { path: "/:slug", route: require("./workspaceRoutes") },
];

routes.forEach((route) => {
  const middlewares = [protect, requireSuperAdminAccess];

  if (route.resource) {
    middlewares.push(queryFilters(route.resource));
  }

  router.use(route.path, ...middlewares, route.route);
});

module.exports = router;
