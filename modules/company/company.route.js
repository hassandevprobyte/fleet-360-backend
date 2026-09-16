const express = require("express");
const router = express.Router();

// Controllers
const companyController = require("./company.controller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: "public/uploads/companies",
  uploadType: "single",
  field: "file",
});

router.route("/").get(companyController.getCompaniesWithPagination).post(upload, companyController.createCompany);
router.route("/all").get(companyController.getAllCompanies);
router.route("/:id").get(companyController.getCompanyById).patch(upload, companyController.updateCompany).delete(companyController.deleteCompany);

module.exports = router;
