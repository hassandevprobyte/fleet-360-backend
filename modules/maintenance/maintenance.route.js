const express = require("express");
const router = express.Router();

// Controllers
const maintenanceController = require("./maintenance.controller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: "public/uploads/maintenance",
  uploadType: "array",
  field: "files",
});

router.route("/").get(maintenanceController.getMaintenanceWithPagination).post(upload, maintenanceController.createMaintenance);
router.route("/all").get(maintenanceController.getAllMaintenance);
router.route("/:id").get(maintenanceController.getMaintenanceById).patch(maintenanceController.updateMaintenance).delete(maintenanceController.deleteMaintenance);

module.exports = router;
