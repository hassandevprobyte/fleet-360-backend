const mongoose = require("mongoose");

// Constants
const { MODELS, DEPRECIATION } = require("../../common/constants");

const schema = new mongoose.Schema(
  {
    fleet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.FLEET,
      required: [true, "fleet is required"],
    },
    method: {
      type: String,
      enum: Object.values(DEPRECIATION.METHODS).map((method) => method.VALUE),
    },
    salvageValue: {
      type: Number,
      min: 0,
    },
    usefulLifeMonths: {
      type: Number,
      min: 1,
    },
    depreciationRate: {
      type: Number,
      min: 0,
    },
    acquisitionCost: {
      type: Number,
      min: 0,
    },
    totalAcquiredUnits: {
      type: Number,
      min: 1,
    },
    totalExpectedUnits: {
      type: Number,
      min: 1,
    },
    startDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(MODELS.DEPRECIATION, schema);
