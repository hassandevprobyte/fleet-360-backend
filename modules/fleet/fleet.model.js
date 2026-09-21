const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const schema = new mongoose.Schema(
  {
    make: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "make is required"],
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "model is required"],
    },
    year: {
      type: Number,
      required: [true, "year is required"],
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "type is required"],
    },
    fuelType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "fuel type is required"],
    },
    transmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "transmission is required"],
    },
    color: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "color is required"],
    },
    licensePlate: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: [true, "license plate is required"],
    },
    purchaseAmount: {
      type: Number,
      required: [true, "purchase amount is required"],
    },
    purchaseDate: {
      type: Date,
      required: [true, "purchase date is required"],
    },
    rent: {
      type: Number,
      default: 0,
    },
    initialOdometer: {
      type: Number,
      default: 0,
    },
    currentOdometer: {
      type: Number,
      default: 0,
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "status is required"],
    },
    condition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      required: [true, "condition is required"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    assignedOn: {
      type: Date,
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(MODELS.FLEET, schema);
