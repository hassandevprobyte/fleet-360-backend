const mongoose = require("mongoose");

// Constants
const COLORS = require("../../constants/COLORS");
const MODELS = require("../../constants/MODELS");
const { SCOPE } = require("../../constants/PICKLIST");

const PicklistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "title is required"],
    },
    value: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "value is required"],
    },
    acronym: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    preserveTitleFormatting: {
      type: Boolean,
      default: false,
    },
    scope: {
      type: String,
      enum: Object.values(SCOPE),
      default: SCOPE.RESOURCE,
    },
    resource: {
      type: String,
      trim: true,
      enum: Object.values(MODELS),
      required: function () {
        return this.scope === SCOPE.RESOURCE;
      },
    },
    field: {
      type: String,
      trim: true,
      required: [true, "field is required"],
    },
    parentPicklist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PICKLIST,
      default: null,
    },
    color: {
      type: String,
      lowercase: true,
      trim: true,
      default: COLORS.GRAY,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    meta: {
      type: Object,
      default: () => ({}),
    },
  },
  { timestamps: true, minimize: false },
);

PicklistSchema.index({ value: 1, scope: 1, resource: 1, field: 1, parentPicklist: 1 }, { unique: true });
PicklistSchema.index({ acronym: 1, scope: 1, resource: 1, field: 1, parentPicklist: 1 }, { unique: true, partialFilterExpression: { acronym: { $type: "string" } } });

module.exports = mongoose.model(MODELS.PICKLIST, PicklistSchema);
