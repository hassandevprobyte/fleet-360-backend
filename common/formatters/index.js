const dayjs = require("dayjs");
const { stringify } = require("csv-stringify/sync");
const winston = require("winston");

const { LOGS_CSV_COLUMNS } = require("../constants");

exports.formatAmount = (amount = 0, locale = "en-US", options = {}) => {
  const defaultOptions = {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: options.notation === "compact" ? 2 : Number.isInteger(amount) ? 0 : 2,
  };

  const formatter = new Intl.NumberFormat(locale, { ...defaultOptions, ...options });

  return formatter.format(amount);
};

exports.formatDate = (date, format = "MMM DD, YYYY") => {
  return dayjs(date).startOf("day").format(format);
};

exports.formatCSVLog = () => {
  const { combine, timestamp, printf } = winston.format;

  return combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    printf((info) => {
      const row = Object.fromEntries(LOGS_CSV_COLUMNS.map((column) => [column, info[column] ?? ""]));

      return stringify([row], {
        columns: LOGS_CSV_COLUMNS,
        header: false,
        record_delimiter: "unix",
      }).trimEnd();
    }),
  );
};
