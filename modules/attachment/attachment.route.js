const express = require("express");
const router = express.Router();

// Controllers
const attachmentController = require("../attachment/attachment.controller");

// Multer
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const upload = uploadMiddleware({
  destination: (req) => `public/uploads/${req.params.resource}/${req.params.resourceId}`,
  uploadType: "array",
  field: "files",
});

router.route("/resource/:resource/:resourceId").get(attachmentController.getAttachmentsByResource).post(upload, attachmentController.addAttachmentsByResource);
router.route("/:id").get(attachmentController.getAttachmentById).delete(attachmentController.deleteAttachment);

module.exports = router;
