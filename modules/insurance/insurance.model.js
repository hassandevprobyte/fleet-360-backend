const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const coverageSchema = {
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PICKLIST,
    required: [true, "type is required"],
  },
  limit: {
    type: Number,
    min: 0,
  },
  deductible: {
    type: Number,
    min: 0,
  },
  premium: {
    type: Number,
    min: 0,
  },
  _id: false,
};

const schema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    fleet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.FLEET,
      required: [true, "fleet is required"],
    },
    policyNumber: {
      type: String,
      trim: true,
      required: [true, "policy number is required"],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "provider is required"],
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "type is required"],
    },
    broker: {
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
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    totalPremium: {
      type: Number,
      min: 0,
    },
    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    deductible: {
      type: Number,
      min: 0,
    },
    coverages: [coverageSchema],
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

module.exports = mongoose.model(MODELS.INSURANCE, schema);
