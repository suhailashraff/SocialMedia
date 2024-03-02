const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const postcontroller = require("../controllers/PostControllers");
const uploadUsingMulter = require("../utils/uploadUsingMulter");

router.post(
  "/createpost",
  authController.protect,
  uploadUsingMulter.uploadPostPhotos,
  postcontroller.createPost
);
router.delete(
  "/deletepost/:id",
  authController.protect,
  postcontroller.deletePost
);

router.get("/getAllPosts", authController.protect, postcontroller.getAllPosts);
router.patch(
  "/updatePost/:id",
  authController.protect,
  uploadUsingMulter.uploadPostPhotos,
  postcontroller.updatePost
);
router.get("/getMyPosts", authController.protect, postcontroller.getMyPosts);

router.post("/likepost/:id", authController.protect, postcontroller.likePost);
router.post(
  "/dislikepost/:id",
  authController.protect,
  postcontroller.dislikePost
);
module.exports = router;
