const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No Documents were found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const Doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions, popOptions2) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.params.id);
    const query = Model.findById({ _id: req.params.id });
    if (popOptions) query.populate(popOptions);
    if (popOptions2) query.populate(popOptions2);
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

exports.getAllDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    // // to get nested routes
    let filter = {};
    if (req.params.articleId) {
      filter = { article: req.params.articleId };
    }
    const Doc = await Model.find(filter);
    res.status(200).json({
      status: "success",
      Documents: Doc.length,
      requestedAt: req.requestTime,
      data: {
        Doc,
      },
    });
  });
