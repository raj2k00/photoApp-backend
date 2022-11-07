const multer = require("multer");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./factoryHandler");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload images", 400), false);
  }
};
// const multerStorage = multer.memoryStorage();
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `public/img/user`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// const upload = multer({ dest: "public/img/users" });
exports.userPhotoUpload = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  let imgUrl = "";

  // File upload
  await cloudinary.uploader.upload(
    `public/img/user/${req.file.filename}`,
    { width: 500, height: 500, crop: "fill", gravity: "auto" },
    (err, image) => {
      // console.log("** File Upload");
      if (err) {
        console.warn(err);
      }
      // console.log(
      //   "* public_id for the uploaded image is generated by Cloudinary's service."
      // );
      // console.log(`* ${image.public_id}`);
      // console.log(`* ${image.url}`);
      imgUrl = image.url;
    }
  );
  req.file.filename = imgUrl;
  next();
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError("Please use /updatePassword for updating password", 400)
    );
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    message:
      "this route is not defined please use /signup instead (USE POST METHOD)",
  });
};

exports.getAllUsers = factory.getAllDoc(User);

exports.getUser = factory.getOne(User, {
  path: "posts",
  select: "_id title",
});

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
