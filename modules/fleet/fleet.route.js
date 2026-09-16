const express = require("express");
const router = express.Router();

// Controllers
const fleetController = require("./fleet.controller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: "public/uploads/fleets",
  uploadType: "array",
  field: "files",
});

router.route("/").get(fleetController.getFleetsWithPagination).post(upload, fleetController.createFleet);
router.get("/summary/byGroup", fleetController.getFleetsSummaryByGroup);
router.route("/:id").get(fleetController.getFleetById).patch(fleetController.updateFleet).delete(fleetController.deleteFleet);

module.exports = router;
