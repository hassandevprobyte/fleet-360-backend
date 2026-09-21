const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const schema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
    },
    fleet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.FLEET,
      required: [true, "fleet is required"],
    },
    taxChallanNumber: {
      type: String,
      trim: true,
      required: [true, "tax challan number is required"],
    },
    jurisdiction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "status is required"],
    },
    startDate: {
      type: Date,
      required: [true, "start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "end date is required"],
    },
    filingDate: {
      type: Date,
    },
    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(MODELS.TAXATION, schema);
