const Boom = require("@hapi/boom");

const isValidDateRange = (startDate, endDate) => {
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

module.exports = isValidDateRange;
