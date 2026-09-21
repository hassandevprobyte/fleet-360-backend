const express = require("express");
const router = express.Router();

// Controllers
const depreciationController = require("./depreciation.controller");

router.route("/").get(depreciationController.getDepreciationsWithPagination).post(depreciationController.createDepreciation);
router.route("/all").get(depreciationController.getAllDepreciations);
router.route("/:id").get(depreciationController.getDepreciationById).patch(depreciationController.updateDepreciation).delete(depreciationController.deleteDepreciation);

module.exports = router;
