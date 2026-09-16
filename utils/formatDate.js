const dayjs = require("dayjs");

const formatDate = (date, format = "MMM DD, YYYY") => {
  return dayjs(date).startOf("day").format(format);
};

module.exports = formatDate;
