const express = require("express");
const router = express.Router();

// Controllers
const insuranceController = require("./insurance.contoller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: "public/uploads/insurance",
  uploadType: "array",
  field: "files",
});

router.route("/").get(insuranceController.getInsuranceWithPagination).post(upload, insuranceController.createInsurance);
router.route("/all").get(insuranceController.getAllInsurance);
router.route("/:id").get(insuranceController.getInsuranceById).patch(insuranceController.updateInsurance).delete(insuranceController.deleteInsurance);

module.exports = router;
