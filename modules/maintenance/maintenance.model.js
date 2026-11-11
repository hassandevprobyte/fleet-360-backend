const mongoose = require("mongoose");

// Constants
const { MODELS, STATUSES } = require("../../common/constants");

const checklistItemSchema = {
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PICKLIST,
    required: [true, "item is required"],
  },
  condition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PICKLIST,
  },
  _id: false,
};

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
      index: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "type is required"],
    },
    priority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    status: {
      type: String,
      enum: Object.values(STATUSES.MAINTENANCE),
      default: STATUSES.MAINTENANCE.INITIATED,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    odometer: {
      type: Number,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    checklist: [checklistItemSchema],
    notes: {
      type: String,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "created by is required"],
    },
    beforeImages: [
      {
        _id: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: MODELS.ATTACHMENT,
      },
    ],
    afterImages: [
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

schema.index({
  vehicle: 1,
  createdAt: -1,
});

schema.index({
  status: 1,
});

schema.index({
  vehicle: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(MODELS.MAINTENANCE, schema);
