const dayjs = require("dayjs");

const isSameDay = (a, b) => {
  if (!a || !b) return false;

  return dayjs(a).isSame(b, "day");
};

module.exports = isSameDay;
