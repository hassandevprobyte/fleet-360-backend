const express = require("express");
const router = express.Router();

// Controllers
const picklistController = require("./picklist.controller");

router.route("/").get(picklistController.getPicklistsWithPagination).post(picklistController.createPicklist);
router.route("/all").get(picklistController.getAllPicklists);
router.get("/category", picklistController.getPicklistCategories);
router.route("/:id").get(picklistController.getPicklistById).patch(picklistController.updatePicklist).delete(picklistController.deletePicklist);

module.exports = router;
