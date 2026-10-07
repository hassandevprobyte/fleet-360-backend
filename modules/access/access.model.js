const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user is required"],
    },
    roles: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.ROLE }],
      required: [true, "roles are required"],
      validate: {
        validator: (v) => v?.length > 0,
        message: "at least one role is required",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(MODELS.ACCESS, schema);
