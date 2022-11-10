const multer = require("multer");
const Jimp = require("jimp");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImages = upload.array("photos", 20);

exports.resizeUploadImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files) return next();

  req.body.photos = [];

  await Promise.all(
    req.files.map(async (file, index) => {
      const extention = file.mimetype.split("/")[1];
      const filename = `${
        file.originalname.replaceAll(" ", "").split(".")[0]
      }-${req.user.id}-${Date.now()}-${index + 1}.${extention}`;

      Jimp.read(file.buffer, async (err, image) => {
        if (err)
          return next(
            new AppError("Error occured while processing image", 500)
          );
        await image
          .cover(2000, 1333) // resize
          .quality(90) // set JPEG quality
          .writeAsync(`public/images/${filename}`); // save
      });
      req.body.photos.push(filename);
    })
  );
  next();
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError("No Documents were found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const Doc = await User.findByIdAndUpdate(
    req.user.id,
    {
      $push: { photos: req.body.photos },
    },
    { new: true }
  );
  if (!Doc) {
    return next(new AppError("No Documents were found with that ID", 404));
  }
  res.status(201).json({
    status: "success",
    data: {
      data: Doc,
    },
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  const doc = await User.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const query = User.findById({ _id: req.user.id });
  const doc = await query;

  if (!doc) {
    return next(new AppError("No Documents were found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const Doc = await User.find();
  res.status(200).json({
    status: "success",
    Documents: Doc.length,
    requestedAt: req.requestTime,
    data: {
      Doc,
    },
  });
});

exports.deletePhotos = catchAsync(async (req, res, next) => {
  const Doc = await User.updateOne(
    { _id: req.user.id },
    {
      $pullAll: { photos: req.body.photos },
    }
  );
  if (!Doc) {
    return next(new AppError("No Photos were found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: {
      data: Doc,
    },
  });
});
