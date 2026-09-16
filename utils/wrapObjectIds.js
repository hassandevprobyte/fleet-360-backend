const mongoose = require("mongoose");
const isValidObjectId = require("./isValidObjectId");

// function wrapObjectIds(value) {
//   if (Array.isArray(value)) {
//     return value.map((item) => wrapObjectIds(item));
//   } else if (value !== null && typeof value === "object" && !(value instanceof Date)) {
//     if (isValidObjectId(value)) {
//       return value;
//     }

//     const converted = Array.isArray(value) ? [] : {};
//     for (const [key, val] of Object.entries(value)) {
//       converted[key] = wrapObjectIds(val);
//     }
//     return converted;
//   } else if (typeof value === "string" && isValidObjectId(value)) {
//     return new ObjectId(value);
//   }
//   return value;
// } // TODO

function wrapObjectIds(value) {
  if (Array.isArray(value)) {
    return value.map(wrapObjectIds);
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, wrapObjectIds(val)]));
  }

  return typeof value === "string" && isValidObjectId(value) ? new mongoose.Types.ObjectId(value) : value;
}

module.exports = wrapObjectIds;
