const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const exemptionSchema = {
  isExempt: {
    type: Boolean,
    default: false,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PICKLIST,
  },
  referenceNumber: {
    type: String,
    trim: true,
    uppercase: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  reason: {
    type: String,
    trim: true,
  },
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
    taxNumber: {
      type: String,
      uppercase: true,
      trim: true,
      required: [true, "tax number is required"],
      index: true,
    },
    taxType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "tax type is required"],
    },
    taxAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "tax authority is required"],
    },
    jurisdiction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "tax status is required"],
    },
    assessmentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    taxYear: {
      type: Number,
      required: [true, "tax year is required"],
    },
    periodStart: {
      type: Date,
      required: [true, "tax period start date is required"],
    },
    periodEnd: {
      type: Date,
      required: [true, "tax period end date is required"],
    },
    assessmentDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: [true, "tax due date is required"],
    },
    filingDate: {
      type: Date,
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "PKR",
    },
    taxableValue: {
      type: Number,
      min: 0,
    },
    taxRate: {
      type: Number,
      min: 0,
    },
    calculatedAmount: {
      type: Number,
      min: 0,
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    adjustmentAmount: {
      type: Number,
      default: 0,
    },
    penaltyAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    exemption: exemptionSchema,
    paymentReference: {
      type: String,
      trim: true,
      uppercase: true,
    },
    registrationNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    vehicleValue: {
      type: Number,
      min: 0,
    },
    engineCapacity: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    fuelType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({
  company: 1,
  fleet: 1,
  taxYear: 1,
});

schema.index({
  fleet: 1,
  taxType: 1,
  periodEnd: 1,
});

schema.index({
  company: 1,
  dueDate: 1,
  status: 1,
});

module.exports = mongoose.model(MODELS.TAXATION, schema);
