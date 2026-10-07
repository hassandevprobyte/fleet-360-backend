const express = require("express");
const router = express.Router();

// Controllers
const accessController = require("./access.controller");

router.route("/").get(accessController.getAccessWithPagination).post(accessController.createAccess);
router.route("/all").get(accessController.getAllAccess);
router.route("/users").get(accessController.getUsersForAccess);
router.route("/:id").get(accessController.getAccessById).patch(accessController.updateAccess).delete(accessController.deleteAccess);

module.exports = router;
