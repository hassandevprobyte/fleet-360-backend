const express = require("express");
const router = express.Router();

// Controllers
const workspaceController = require("./workspace.controller");

router.route("/").get(workspaceController.getWorkspaceBySlug).patch(workspaceController.updateWorkspaceBySlug);

module.exports = router;
