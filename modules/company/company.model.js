const mongoose = require("mongoose");

// Constants
const MODELS = require("../../constants/MODELS");

const addressSchema = {
  street: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "street is required"],
  },
  city: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "city is required"],
  },
  state: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "state is required"],
  },
  country: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "country is required"],
  },
  zipCode: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "zipCode is required"],
  },
};

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "title is required"],
    },
    acronym: {
      type: String,
      uppercase: true,
      unique: true,
      trim: true,
      required: [true, "acronym is required"],
    },
    imgUrl: {
      type: String,
    },
    website: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: addressSchema,
      _id: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(MODELS.COMPANY, schema);
