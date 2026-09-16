const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const AttachmentSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      enum: Object.values(MODELS),
      required: [true, "resource is required"],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "resource",
      required: [true, "resource id is required"],
    },
    originalName: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    size: {
      type: Number,
    },
    filePath: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

AttachmentSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

module.exports = mongoose.model(MODELS.ATTACHMENT, AttachmentSchema);
