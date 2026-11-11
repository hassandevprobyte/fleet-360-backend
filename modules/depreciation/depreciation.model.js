const mongoose = require("mongoose");

// Constants
const { MODELS, DEPRECIATION } = require("../../common/constants");

const schema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.VEHICLE,
      required: [true, "vehicle is required"],
    },
    method: {
      type: String,
      enum: Object.values(DEPRECIATION.METHODS).map((method) => method.VALUE),
    },
    year: {
      type: Date,
    },
    salvageValue: {
      type: Number,
      min: 0,
    },
    purchaseValue: {
      type: Number,
      min: 0,
    },
    bookValue: {
      type: Number,
      min: 0,
    },
    depreciationExpense: {
      type: Number,
      min: 0,
    },
    accumulatedDepreciation: {
      type: Number,
      min: 0,
    },
    remainingUsefulLife: {
      type: Number,
      min: 1,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(MODELS.DEPRECIATION, schema);
