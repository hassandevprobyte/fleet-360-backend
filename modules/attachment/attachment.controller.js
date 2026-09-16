const asyncHandler = require("express-async-handler");

// Services
const attachmentService = require("./attachment.service");

// @desc    Get attachment by id
// @route   GET /api/v1/attachments/:id
// @access  Private
exports.getAttachmentById = asyncHandler(async (req, res) => {
  const data = await attachmentService.getAttachmentById(req.params.id);

  res.status(200).json(data);
});

// @desc    Get attachments by resource
// @route   GET /api/v1/attachments/resource/:resource/:resourceId
// @access  Private
exports.getAttachmentsByResource = asyncHandler(async (req, res) => {
  const data = await attachmentService.getAttachmentsByResource(req.params.resource, req.params.resourceId);

  res.status(200).json(data);
});

// @desc    Add attachments by resource
// @route   GET /api/v1/attachments/resource/:resource/:resourceId
// @access  Private
exports.addAttachmentsByResource = asyncHandler(async (req, res) => {
  const payload = {
    resource: req.params.resource,
    resourceId: req.params.resourceId,
    files: req.files,
    uploadedBy: req.user._id,
  };

  const data = await attachmentService.addAttachments(payload);

  res.status(200).json(data);
});

// @desc    Delete attachment
// @route   DELETE /api/v1/attachments/:id
// @access  Private
exports.deleteAttachment = asyncHandler(async (req, res) => {
  const data = await attachmentService.deleteAttachment(req.params.id);

  res.status(200).json(data);
});
