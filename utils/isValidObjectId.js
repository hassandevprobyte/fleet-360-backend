const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const isValidObjectId = (str) => {
  return /^[0-9a-fA-F]{24}$/.test(str) && ObjectId.isValid(str);
};

module.exports = isValidObjectId;
