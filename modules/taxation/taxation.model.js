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
    challanNumber: {
      type: String,
      trim: true,
      required: [true, "challan number is required"],
    },
    jurisdiction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
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
    amount: {
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
    documents: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(MODELS.TAXATION, schema);
