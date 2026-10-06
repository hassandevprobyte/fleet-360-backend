const express = require("express");
const router = express.Router();

// Controllers
const taxationController = require("./taxation.controller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: "public/uploads/taxation",
  uploadType: "fields",
  field: [{ name: "documents", maxCount: 10 }],
});

router.route("/").get(taxationController.getTaxationWithPagination).post(upload, taxationController.createTaxation);
router.route("/all").get(taxationController.getAllTaxation);
router.route("/:id").get(taxationController.getTaxationById).patch(upload, taxationController.updateTaxation).delete(taxationController.deleteTaxation);

module.exports = router;
