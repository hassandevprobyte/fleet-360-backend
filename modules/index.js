const express = require("express");
const router = express.Router();

// Middlewares
const protect = require("../middleware/authMiddleware");
const queryFilters = require("../middleware/queryFilters");
const checkPermissions = require("../middleware/checkPermissions");
const requireSuperAdminAccess = require("../middleware/requireSuperAdminAccess");
const requireWorkspaceAccess = require("../middleware/requireWorkspaceAccess");

// Constants
const { MODELS } = require("../common/constants");

// Admin routes
const adminRoutes = [
  { path: "/attachments", resource: MODELS.ATTACHMENT, route: require("./attachment/attachment.route") },
  { path: "/users", resource: MODELS.USER, route: require("./user/user.route") },
  { path: "/workspaces", resource: MODELS.WORKSPACE, route: require("./workspace/workspace.admin.route") },
];

// Workspace routes
const workspaceRoutes = [
  { path: "/attachments", resource: MODELS.ATTACHMENT, route: require("./attachment/attachment.route") },
  { path: "/depreciations", resource: MODELS.DEPRECIATION, route: require("./depreciation/depreciation.route") },
  { path: "/vehicles", resource: MODELS.VEHICLE, route: require("./vehicle/vehicle.route") },
  { path: "/insurance", resource: MODELS.INSURANCE, route: require("./insurance/insurance.route") },
  { path: "/maintenance", resource: MODELS.MAINTENANCE, route: require("./maintenance/maintenance.route") },
  { path: "/picklists", resource: MODELS.PICKLIST, route: require("./picklist/picklist.route") },
  { path: "/taxation", resource: MODELS.TAXATION, route: require("./taxation/taxation.route") },
  { path: "/roles", resource: MODELS.ROLE, route: require("./role/role.route") },
  { path: "/users", resource: MODELS.USER, route: require("./user/user.route") },
  { path: "/", resource: MODELS.WORKSPACE, route: require("./workspace/workspace.route") },
];

// Route groups
const routeGroups = [
  {
    prefix: "/admin",
    middlewares: [protect, requireSuperAdminAccess],
    routes: adminRoutes,
    permissions: false,
  },
  {
    prefix: "/:slug",
    middlewares: [protect, requireWorkspaceAccess],
    routes: workspaceRoutes,
    permissions: true,
  },
];

// Register route groups
routeGroups.forEach(({ prefix, middlewares, routes, permissions }) => {
  const childRouter = express.Router({ mergeParams: true });

  routes.forEach(({ path, resource, route }) => {
    const routeMiddlewares = [];

    if (resource) {
      if (permissions) {
        routeMiddlewares.push(checkPermissions(resource));
      }

      routeMiddlewares.push(queryFilters(resource));
    }

    childRouter.use(path, ...routeMiddlewares, route);
  });

  router.use(prefix, ...middlewares, childRouter);
});

module.exports = router;
