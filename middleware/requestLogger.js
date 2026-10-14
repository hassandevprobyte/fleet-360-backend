const { performance } = require("node:perf_hooks");
const { randomUUID } = require("crypto");
const { UAParser } = require("ua-parser-js");

// Middlewares
const logger = require("../utils/logger");

// Environment Variables
const { env } = require("../config");

module.exports = (req, res, next) => {
  const start = performance.now();
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgent);

  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  res.on("finish", () => {
    const duration = performance.now() - start;

    const ip = req.headers["x-real-ip"] || req.ip;
    const protocol = req.headers["x-scheme"] || req.protocol;
    const userId = req.user?.id?.toString() || "-";

    const message = {
      ip: `${ip}`,
      protocol: `${protocol}`,
      method: `${req.method}`,
      url: `${req.originalUrl}`,
      request: `${requestId}`,
      user: `${userId}`,
      status: `${res.statusCode}`,
      message: `${res.message || "-"}`,
      duration: `${duration}ms`,
      meta: {
        browser: `${browser.name || "Unknown"} ${browser.version || ""}`,
        os: `${os.name || "Unknown"} ${os.version || ""}`,
        device: `${device.type || "desktop"}`,
        referer: `${req.get("referer") || "-"}`,
        environment: `${env.NODE_ENV || "development"}`,
      },
    };

    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.error(message);
    } else if (res.statusCode >= 200 && res.statusCode < 400) {
      logger.success(message);
    } else {
      logger.info(message);
    }
  });

  next();
};
