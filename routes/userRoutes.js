const express = require("express");

const router = express.Router();

const {
  uploadImages,
  resizeUploadImages,
  updateUser,
  deletePhotos,
} = require("../controllers/userController");

const {
  signup,
  login,
  verifyEmail,
  protect,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.patch("/verifyEmail/:token", verifyEmail);

router
  .route("/upload")
  .post(protect, uploadImages, resizeUploadImages, updateUser);

router.route("/deletePhotos").patch(protect, deletePhotos);

module.exports = router;
