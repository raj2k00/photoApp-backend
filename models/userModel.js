const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrpypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, "Please provide your first name!"],
    },
    lname: {
      type: String,
      required: [true, "Please provide your last name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your Email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid Email "],
    },
    photos: {
      type: [String],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phoneNumber"],
    },
    password: {
      type: String,
      required: [true, "Please provide the password"],
      minlength: 8,
      select: false,
    },
    isVerfied: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  // Only this function works when the password is modified
  if (!this.isModified("password")) return next();
  // Hashing the password
  this.password = await bcrpypt.hash(this.password, 10);

  next();
});

userSchema.methods.checkPassword = async function (
  givenPassword,
  storedPassword
) {
  return await bcrpypt.compare(givenPassword, storedPassword);
};

userSchema.methods.createEmailVerificationToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256", process.env.CRYPTO_SECRET)
    .update(resetToken)
    .digest("hex");

  this.emailVerificationTokenExpires = Date.now() + 30 * 60 * 1000; // Expire-Time 30 minutes after issuing

  // console.log(resetToken, this.emailVerificationToken);
  return resetToken;
};

const User = mongoose.model("user", userSchema);

module.exports = User;
