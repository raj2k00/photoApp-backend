const path = require("path");
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

//Importing Routers
const userRouter = require("./routes/userRoutes");

//Importing Error Controllers
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();
app.enable("trust proxy");

//Setting view engine and views directory
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

//Impelementing CORS policy
//This will also cross origin resourse sharing for simple requests like
//GET and POST
app.use(cors());
//For complex request like PATCH,DELETE,PUT
app.options("*", cors());

//Adding security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Limiting the request from the same IP to prevent DOS attacks
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP please try again after one hour",
});

app.use("/api", limiter);
//Setting Body Paser in Express
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());
// to prevent against NoSQL query injection
app.use(mongoSanitize());
//to prevent against xss attacks
app.use(xss());
// to prevent prameter pollution

app.use(compression());
//Middleware
app.use((req, res, next) => {
  console.log("Server hit the request ");
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  // next() is very important! it maintains the flow form one middleware to other
  next();
});

// Request Routes for API
app.use("/api/v1/users", userRouter);

// Middleware for handling routes that are not yet defined
app.use("*", (req, res, next) => {
  next(
    new AppError(
      `The requested route ${req.originalUrl} is not yet defined`,
      404
    )
  );
});

// Global Error handler
app.use(globalErrorHandler);

module.exports = app;
