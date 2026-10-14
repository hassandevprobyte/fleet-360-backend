require("colors");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const app = express();

const { errorHandler } = require("./middleware/errorHandler");
const bootstrap = require("./bootstrap");
const { corsOptions, env } = require("./config");
const backup = require("./config/backup");
const pagination = require("./middleware/pagination");
const requestLogger = require("./middleware/requestLogger");

// app.use(helmet());

app.use(cors(corsOptions));

app.use(compression());

app.use(requestLogger);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(cookieParser());

app.use(mongoSanitize());

app.use(pagination);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/api/v1", require("./modules"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await bootstrap();

    backup();

    app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`.bgWhite.black);
    });
  } catch (error) {
    console.error("Failed to start server".bgRed.white, error);
    process.exit(1);
  }
};

startServer();
