const normalizeToArray = (value) => {
  if (value == null) return [];

  return Array.isArray(value) ? value : [value];
};

module.exports = normalizeToArray;
