const mongoose = require("mongoose");

// Constants
const CRUD = require("../../constants/CRUD");
const SCOPE = require("../../constants/SCOPE");
const MODELS = require("../../constants/MODELS");

const RoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: [true, "title is required"],
    },
    permissions: [
      {
        _id: false,
        resource: {
          type: String,
          trim: true,
          required: [true, "resource is required"],
        },
        actions: [
          {
            type: String,
            lowercase: true,
            trim: true,
            required: [true, "actions are required"],
            enum: Object.values(CRUD),
          },
        ],
        allowedUpdateFields: {
          type: [String],
        },
      },
    ],
    scope: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "scope is required"],
      enum: Object.values(SCOPE),
    },
    indexPath: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "index path is required"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(MODELS.ROLE, RoleSchema);
