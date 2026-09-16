const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    companies: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.COMPANY }],
      required: [true, "companies are required"],
      validate: {
        validator: (v) => v?.length > 0,
        message: "at least one company is required",
      },
    },
    brands: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.BRAND }],
      required: [true, "brands are required"],
      validate: {
        validator: (v) => v?.length > 0,
        message: "at least one brand is required",
      },
    },
    roles: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.ROLE }],
      required: [true, "roles are required"],
      validate: {
        validator: (v) => v?.length > 0,
        message: "at least one role is required",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(MODELS.USER, UserSchema);
