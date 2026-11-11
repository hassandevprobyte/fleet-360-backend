const express = require("express");
const router = express.Router();

// Controllers
const vehicleController = require("./vehicle.controller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: "public/uploads/vehicle",
  uploadType: "fields",
  field: [
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ],
});

router.route("/").get(vehicleController.getVehiclesWithPagination).post(upload, vehicleController.createVehicle);
router.route("/all").get(vehicleController.getAllVehicles);
router.route("/export").get(vehicleController.exportVehicles);
router.route("/:id").get(vehicleController.getVehicleById).patch(upload, vehicleController.updateVehicle).delete(vehicleController.deleteVehicle);

module.exports = router;
