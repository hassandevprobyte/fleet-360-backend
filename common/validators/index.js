const Boom = require("@hapi/boom");
const dayjs = require("dayjs");
const lodash = require("lodash");
const mongoose = require("mongoose");

exports.isValidDateRange = (startDate, endDate) => {
  if (startDate == null && endDate == null) {
    return true;
  }

  if (startDate != null && Number.isNaN(new Date(startDate).getTime())) {
    throw Boom.badRequest("Invalid date.");
  }

  if (endDate != null && Number.isNaN(new Date(endDate).getTime())) {
    throw Boom.badRequest("Invalid date.");
  }

  if (startDate == null || endDate == null) {
    return true;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw Boom.badRequest("End date must be greater than start date");
  }

  return true;
};

exports.isValidObjectId = (str) => {
  const ObjectId = mongoose.Types.ObjectId;

  return /^[0-9a-fA-F]{24}$/.test(str) && ObjectId.isValid(str);
};

exports.isSameDay = (a, b) => {
  if (!a || !b) return false;

  return dayjs(a).isSame(b, "day");
};

exports.areSameIds = (a = [], b = []) => lodash.isEqual(a.map(String).sort(), b.map(String).sort());
