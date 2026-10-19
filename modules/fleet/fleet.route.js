const express = require("express");
const router = express.Router();

// Controllers
const fleetController = require("./fleet.controller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: "public/uploads/fleet",
  uploadType: "fields",
  field: [
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ],
});

router.route("/").get(fleetController.getFleetsWithPagination).post(upload, fleetController.createFleet);
router.route("/all").get(fleetController.getAllFleets);
router.route("/export").get(fleetController.exportFleets);
router.get("/summary/byGroup", fleetController.getFleetsSummaryByGroup);
router.route("/:id").get(fleetController.getFleetById).patch(upload, fleetController.updateFleet).delete(fleetController.deleteFleet);

module.exports = router;
