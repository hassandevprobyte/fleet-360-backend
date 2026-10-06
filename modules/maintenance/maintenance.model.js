const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");
const ENUMS = require("../../constants/ENUMS");

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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    fleet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.FLEET,
      required: [true, "fleet is required"],
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
      enum: Object.values(ENUMS.MAINTENANCE.STATUSES),
      default: ENUMS.MAINTENANCE.STATUSES.INITIATED,
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
    },
    conditionBefore: {
      type: [String],
    },
    conditionAfter: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

schema.index({
  fleet: 1,
  createdAt: -1,
});

schema.index({
  company: 1,
  status: 1,
});

schema.index({
  fleet: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(MODELS.MAINTENANCE, schema);
