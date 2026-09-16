const express = require("express");
const router = express.Router();

// Controllers
const roleController = require("./role.controller");

router.route("/").get(roleController.getRolesWithPagination).post(roleController.createRole);
router.route("/all").get(roleController.getAllRoles);
router.get("/resources", roleController.getAllResources);
router.get("/scopes", roleController.getAllScopes);
router.route("/:id").get(roleController.getRoleById).patch(roleController.updateRole).delete(roleController.deleteRole);

module.exports = router;
