const mongoose = require("mongoose");

// Constants
const { COLORS, CURRENCY, DEPRECIATION, MODELS, STATUSES, TIMEZONE } = require("../../common/constants");

const memberSchema = {
  _id: false,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
    required: [true, "user is required"],
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
};

const settingSchema = {
  _id: false,
  timezone: {
    type: String,
    enum: Object.values(TIMEZONE),
    default: TIMEZONE.UTC,
  },
  currency: {
    type: String,
    enum: Object.values(CURRENCY),
    default: CURRENCY.USD,
  },
};

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.USER,
      required: [true, "user is required"],
    },
    title: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      trim: true,
      required: [true, "slug is required"],
    },
    color: {
      type: String,
      enum: Object.values(COLORS),
      default: COLORS.GRAY,
    },
    status: {
      type: String,
      enum: Object.values(STATUSES.WORKSPACE),
      default: STATUSES.WORKSPACE.ACTIVE,
    },
    depreciation: {
      type: String,
      enum: Object.values(DEPRECIATION.METHODS).map((method) => method.VALUE),
    },
    members: {
      type: [memberSchema],
      default: [],
      validate: {
        validator: (members) => new Set(members.map((member) => String(member.user))).size === members.length,
        message: "workspace members must be unique",
      },
    },
    settings: {
      type: settingSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

schema.index({ user: 1 }, { unique: true });
schema.index({ "members.user": 1 });

module.exports = mongoose.model(MODELS.WORKSPACE, schema);
