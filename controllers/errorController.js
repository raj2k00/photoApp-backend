const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = (err) => {
  const message = `Document with name - ${err.keyValue.name} - already exists`;
  return new AppError(message, 400);
};
const handleValidatonFieldDB = (err) => {
  const errorMsg = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errorMsg.join(". ")} `;
  return new AppError(message, 400);
};

const handleInvalidSignature = () => {
  const message = "Invalid token! Please log in again";
  return new AppError(message, 401);
};

const handleTokenExpiredError = () => {
  const message = "Token has expired! Please log in again";
  return new AppError(message, 401);
};

const sendDevError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // API ERROR
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  // RENDER ERROR FOR WEBSITE
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Not Found",
    msg: err.message,
    status: err.statusCode,
  });
};
const sendProductionError = (err, req, res) => {
  // Operational ,trusted error which can be sent to the clients
  //API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming error or third party library error not sending details
    }
    // Logging the error
    console.error("ERROR 💥", err);
    //Sending Genering Message
    return res.status(500).json({
      status: "error",
      error: err,
      message: "Something went wrong please try again sometime",
    });
  }
  // RENDER WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Not Found",
      msg: err.message,
      status: err.statusCode,
    });
    // Programming error or third party library error not sending details
  }
  // Logging the error
  console.error("ERROR 💥", err);
  //Sending Genering Message
  return res.status(err.statusCode).render("error", {
    title: "Not Found",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.message = err.message;
    if (error.path === "_id") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDublicateFieldsDB(error);
    if (error._message === "User validation failed")
      error = handleValidatonFieldDB();
    if (error.name === "JsonWebTokenError") error = handleInvalidSignature();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();
    sendProductionError(error, req, res);
  }
};
