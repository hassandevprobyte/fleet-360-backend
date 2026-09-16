const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    make: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Picklist",
      required: [true, "vehicle make is required"],
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Picklist",
      required: [true, "vehicle model is required"],
    },
    year: {
      type: Number,
      required: [true, "year is required"],
    },
    color: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "vehicle color is required"],
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
      ref: "Picklist",
      required: [true, "vehicle status is required"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "company is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedOn: {
      type: Date,
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
