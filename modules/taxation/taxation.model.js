const mongoose = require("mongoose");

// Constants
const { MODELS } = require("../../common/constants");

const schema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.WORKSPACE,
      required: [true, "workspace is required"],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.VEHICLE,
      required: [true, "vehicle is required"],
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
      ref: MODELS.USER,
      required: [true, "created by is required"],
    },
    documents: [
      {
        _id: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: MODELS.ATTACHMENT,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(MODELS.TAXATION, schema);
