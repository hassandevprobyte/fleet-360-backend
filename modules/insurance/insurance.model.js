const mongoose = require("mongoose");

// Constants
const { MODELS, STATUSES } = require("../../common/constants");

const schema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.WORKSPACE,
      required: [true, "workspace is required"],
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
    status: {
      type: String,
      enum: Object.values(STATUSES.INSURANCE),
      default: STATUSES.INSURANCE.ACTIVE,
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
    premium: {
      type: Number,
      min: 0,
      required: [true, "premium is required"],
    },
    coverage: {
      type: Number,
      min: 0,
      required: [true, "coverage is required"],
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

module.exports = mongoose.model(MODELS.INSURANCE, schema);
