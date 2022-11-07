const express = require("express");

// const commentRouter = require("./commentRoutes");

// const { protect, restrictTo } = require("../controllers/authController");

// // const {
// //   getAllArticle,
// //   getOneArticle,
// //   createOne,
// //   updateOne,
// //   deleteOne,
// //   uploadArticleCover,
// //   resizeCoverPhoto,
// // } = require("../controllers/imageController");

const router = express.Router();

// //WORKING:
// router
//   .route("/")
//   .get(getAllArticle)
//   .post(
//     protect,
//     restrictTo("admin"),
//     uploadArticleCover,
//     resizeCoverPhoto,
//     createOne
//   );

// //WORKING:
// router
//   .route("/:id")
//   .get(getOneArticle)
//   .patch(
//     protect,
//     restrictTo("admin"),
//     uploadArticleCover,
//     resizeCoverPhoto,
//     updateOne
//   )
//   .delete(protect, restrictTo("admin"), deleteOne);

module.exports = router;
