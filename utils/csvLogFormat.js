const winston = require("winston");
const { stringify } = require("csv-stringify/sync");

const { combine, timestamp, printf } = winston.format;

exports.COLUMNS = ["timestamp", "level", "ip", "protocol", "method", "url", "request", "user", "status", "message", "duration", "meta"];

exports.csvLogFormat = combine(
  timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  printf((info) => {
    const row = Object.fromEntries(exports.COLUMNS.map((column) => [column, info[column] ?? ""]));

    return stringify([row], {
      columns: exports.COLUMNS,
      header: false,
      record_delimiter: "unix",
    }).trimEnd();
  }),
);
