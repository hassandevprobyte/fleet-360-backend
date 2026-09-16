const { env } = require("../config");

const handleJoiError = (err) => {
  return {
    statusCode: 400,
    message: err.details[0].message,
  };
};

const handleBoomError = (err) => {
  return {
    statusCode: err.output.statusCode,
    message: err.output.payload.message,
  };
};

const handleBasecampError = (err) => {
  return {
    statusCode: err.status,
    message: err.response.data.error,
  };
};

const handleDefaultError = (err) => {
  return {
    statusCode: +err.statusCode || 500,
    message: err.message ? err.message : "Internal server error",
    stack: env.NODE_ENV === "development" ? err.stack : null,
  };
};

const errorHandler = (err, req, res, next) => {
  let metaData;

  if (err.isJoi) {
    metaData = handleJoiError(err);
  } else if (err.isBoom) {
    metaData = handleBoomError(err);
  } else if (err.isBasecamp) {
    metaData = handleBasecampError(err);
  } else {
    metaData = handleDefaultError(err);
  }

  res.status(+metaData.statusCode).json(metaData);
};

module.exports = {
  errorHandler,
};
