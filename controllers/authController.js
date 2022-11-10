const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signedToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createTokenSend = (user, statusCode, res, req) => {
  const token = signedToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };
  res.cookie("jwt", token, cookieOption);

  // /Removing the password from the output data
  user.password = undefined;

  res.status(statusCode).json({
    token: token,
    status: "success",
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
  });

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError("There is no user with that email address", 404));

  // console.log(user);
  // console.log(newUser);
  const resetToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verifyEmail/${resetToken}`;

  try {
    await new Email(user, resetUrl).sendEmailVerification();
    createTokenSend(user, 201, res, req);
  } catch (error) {
    this.emailVerificationToken = undefined;
    this.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log("error", error);
    return next(
      new AppError(
        "There was an error sending password Verification Email. Please try again later",
        500
      )
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please Provide Email and Password", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Incorrect Username or Password", 401));
  }
  createTokenSend(user, 200, res, req);
});

exports.logOut = catchAsync((req, res, next) => {
  res.cookie("jwt", "LoggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and checking if it is there.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(new AppError("Please Log in to access this page", 401));
  // 2. Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3.Check if the user is verified or not
  const verifiedUser = await User.findById(decoded.id);
  if (!verifiedUser) {
    return next(new AppError("User is no longer exist", 401));
  }

  if (!verifiedUser.isVerfied) {
    return next(new AppError("Please verify email", 401));
  }
  // Passed all conditions proced to next middleware with req.user document
  res.locals.user = verifiedUser;
  req.user = verifiedUser;

  next();
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256", process.env.CRYPTO_SECRET)
    .update(req.params.token)
    .digest("hex");

  // console.log(hashedToken);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  // console.log(user);

  if (!user) return next(new AppError("Token is invalid or expired", 400));
  user.isVerfied = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createTokenSend(user, 200, res, req);
});
