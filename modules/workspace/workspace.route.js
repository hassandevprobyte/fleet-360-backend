const express = require("express");
const router = express.Router();

// Controllers
const workspaceController = require("./workspace.controller");

router.route("/").get(workspaceController.getWorkspacesWithPagination).post(workspaceController.createWorkspace);
router.route("/all").get(workspaceController.getAllWorkspaces);
router.route("/:id").get(workspaceController.getWorkspaceById).patch(workspaceController.updateWorkspace).delete(workspaceController.deleteWorkspace);

module.exports = router;
