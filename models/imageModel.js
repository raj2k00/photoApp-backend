const mongoose = require("mongoose");

const imageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " Image must have a name"],
    },
    type: {
      type: String,
      required: [true, " Image must have a valid type"],
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "Image must belong to a owner"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

imageSchema.index({ name: 1 });

imageSchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: ["name"],
  });
  next();
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
