const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");
const { stringify } = require("csv-stringify/sync");

// Environment Variables
const { env } = require("../../config");

// Utilities
const { formatCSVLog } = require("../formatters");
const { LOGS_CSV_COLUMNS, COLORS } = require("../constants");

const { combine, colorize, simple } = winston.format;

const LOG_CONFIG = {
  DIRECTORY: path.join(process.cwd(), "logs"),
  ROTATION_PERIOD: "YYYY-ww",
  MAX_SIZE: "20m",
  RETENTION: "28d",
};

fs.mkdirSync(LOG_CONFIG.DIRECTORY, { recursive: true });

const levels = {
  error: 0,
  success: 1,
  info: 2,
};

winston.addColors({
  error: COLORS.RED,
  success: COLORS.GREEN,
  info: COLORS.CYAN,
});

const onlyLevel = (level) => winston.format((info) => (info.level === level ? info : false))();

const createFileTransport = (level) =>
  new DailyRotateFile({
    dirname: LOG_CONFIG.DIRECTORY,
    filename: `${level}-%DATE%.csv`,
    datePattern: LOG_CONFIG.ROTATION_PERIOD,
    maxSize: LOG_CONFIG.MAX_SIZE,
    maxFiles: LOG_CONFIG.RETENTION,
    level,
    format: combine(onlyLevel(level), formatCSVLog()),
  });

const fileTransports = [createFileTransport("error"), createFileTransport("success"), createFileTransport("info")];

for (const transport of fileTransports) {
  transport.on("new", (filename) => {
    try {
      if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
        return;
      }

      fs.writeFileSync(
        filename,
        stringify([LOGS_CSV_COLUMNS], {
          record_delimiter: "unix",
        }),
      );
    } catch (error) {
      console.error("CSV header error:", error);
    }
  });

  transport.on("error", (error) => {
    console.error("CSV logging error:", error);
  });
}

const logger = winston.createLogger({
  levels,
  level: "info",
  transports: [
    ...fileTransports,

    env.NODE_ENV === "development"
      ? new winston.transports.Console({
          format: combine(colorize(), simple()),
        })
      : null,
  ],
});

module.exports = logger;
