const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const BrandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "title is required"],
    },
    acronym: {
      type: String,
      uppercase: true,
      trim: true,
      required: [true, "acronym is required"],
    },
    brandUrl: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "brand url is required"],
    },
    imgUrl: {
      type: String,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY,
      required: [true, "company is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

BrandSchema.index({ title: 1, company: 1 }, { unique: true });
BrandSchema.index({ acronym: 1, company: 1 }, { unique: true });

module.exports = mongoose.model(MODELS.BRAND, BrandSchema);
