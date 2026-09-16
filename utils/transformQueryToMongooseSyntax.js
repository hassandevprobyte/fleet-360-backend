const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const isValidObjectId = require("./isValidObjectId");

const TYPES = {
  STRING: "String",
  NUMBER: "Number",
  BOOLEAN: "Boolean",
  DATE: "Date",
  OBJECT_ID: "ObjectId",
  ARRAY: "Array",
};

function getSchemaType(modelName, key) {
  const schema = mongoose.model(modelName).schema;
  const path = schema.path(key);
  // const path = schema.path(key) || schema.subpaths?.[key];

  if (!path) return null;

  if (path.instance === "Array") {
    const subPath = schema.subpaths?.[`${key}.$`];

    if (!subPath) return null;

    return subPath.instance;
  }

  return path.instance;
}

function convertValueByType(value, type) {
  if (value == null) return value;

  switch (type) {
    case TYPES.STRING:
      return String(value);

    case TYPES.NUMBER:
      return !isNaN(Number(value)) ? Number(value) : value;

    case TYPES.BOOLEAN:
      return value === "true" ? true : value === "false" ? false : value;

    case TYPES.DATE:
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;

    case TYPES.OBJECT_ID:
      return isValidObjectId(value) ? new ObjectId(value) : value;

    default:
      return value;
  }
}

function transformOperators(key, value, type) {
  if (Array.isArray(value) && value.length > 0) {
    if (type === TYPES.STRING) {
      return { $or: value.map((v) => ({ [key]: { $regex: v, $options: "i" } })) };
    }

    if (type === TYPES.NUMBER || type === TYPES.OBJECT_ID) {
      return { [key]: { $in: value } };
    }

    if (type === TYPES.DATE && value.length === 2) {
      const [start, end] = value;

      const startDate = new Date(start);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(end);
      endDate.setUTCHours(23, 59, 59, 999);

      return { [key]: { $gte: startDate, $lte: endDate } };
    }

    return { [key]: value };
  }

  if (type === TYPES.STRING) {
    return { [key]: { $regex: value, $options: "i" } };
  }

  return { [key]: value };
}

function convertQueryParams(modelName, queryParams) {
  if (Array.isArray(queryParams)) {
    return queryParams.map((v) => convertQueryParams(modelName, v));
  }

  if (!queryParams || typeof queryParams !== "object") {
    return queryParams; // primitive value
  }

  let result = {};

  for (const [key, rawValue] of Object.entries(queryParams)) {
    const type = getSchemaType(modelName, key);

    // Nested object
    if (typeof rawValue === "object" && rawValue !== null && !Array.isArray(rawValue) && !isValidObjectId(rawValue)) {
      result[key] = convertQueryParams(modelName, rawValue);

      continue;
    }
    // if (typeof rawValue === "object" && rawValue !== null && !Array.isArray(rawValue)) {
    //   const operatorObject = {};

    //   for (const [op, val] of Object.entries(rawValue)) {
    //     operatorObject[op] = Array.isArray(val) ? val.map((v) => convertValueByType(v, type)) : convertValueByType(val, type);
    //   }

    //   result[key] = operatorObject;

    //   continue;
    // } // TODO

    // Array or single value
    const values = Array.isArray(rawValue) ? rawValue.map((v) => convertValueByType(v, type)) : convertValueByType(rawValue, type);

    Object.assign(result, transformOperators(key, values, type));
  }

  return result;
}

/**
 * Transform raw query params into Mongoose-compatible syntax.
 * - Filters only allowed fields
 * - Converts values to correct types based on schema
 * - Applies operators via convertQueryParams
 * - Preserves fields that shouldn't be transformed
 *
 * @param {string} modelName - Mongoose model name
 * @param {object} queryParams - Raw query parameters
 * @param {string[]} additionalFields - Extra fields allowed in addition to schema fields
 * @param {string[]} fieldsNotToTransform - Fields to include as-is (skip conversion/operators)
 * @returns {object} Mongoose-ready filter object
 */
function transformQueryToMongooseSyntax(modelName, queryParams = {}, additionalFields = [], fieldsNotToTransform = []) {
  const modelSchemaFields = Object.keys(mongoose.model(modelName).schema.paths);

  const allowedFields = [...modelSchemaFields, ...additionalFields].filter((field) => !fieldsNotToTransform.includes(field));

  const isValidValue = (val) => val !== undefined && val !== null && val !== "";

  const allowedParams = Object.fromEntries(Object.entries(queryParams).filter(([key, value]) => allowedFields.includes(key) && isValidValue(value)));

  const rawFields = Object.fromEntries(fieldsNotToTransform.map((key) => [key, queryParams[key]]).filter(([_, val]) => isValidValue(val)));

  const transformed = convertQueryParams(modelName, allowedParams);

  return { ...transformed, ...rawFields };
}

module.exports = transformQueryToMongooseSyntax;
