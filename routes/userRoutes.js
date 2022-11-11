const express = require("express");

const router = express.Router();

const {
  uploadImages,
  resizeUploadImages,
  updateUser,
  deletePhotos,
  uploadBase64Image,
  getUser,
} = require("../controllers/userController");

const {
  signup,
  login,
  verifyEmail,
  protect,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/verifyEmail/:token", verifyEmail);
router.route("/getUser").get(protect, getUser);

router
  .route("/upload")
  .post(protect, uploadImages, resizeUploadImages, updateUser);

router.route("/uploadbase64").post(protect, uploadBase64Image, updateUser);

router.route("/deletePhotos").patch(protect, deletePhotos);

module.exports = router;
