const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const componentSchema = {
  component: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PICKLIST,
    required: [true, "component is required"],
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    required: [true, "quantity is required"],
  },
  unitCost: {
    type: Number,
    min: 0,
    required: [true, "unit cost is required"],
  },
  totalCost: {
    type: Number,
    min: 0,
    required: [true, "total cost is required"],
  },
  _id: false,
};

const checklistItemSchema = {
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PICKLIST,
    required: [true, "item is required"],
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PICKLIST,
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
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    priority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
    },
    assignedOn: {
      type: Date,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    startedDate: {
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
    components: [componentSchema],
    checklist: [checklistItemSchema],
    notes: {
      type: String,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
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
