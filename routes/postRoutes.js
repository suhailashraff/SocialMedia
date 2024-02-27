const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const postcontroller = require("../controllers/PostControllers");

router.post("/createpost", authController.protect, postcontroller.createPost);
router.delete(
  "/deletepost/:id",
  authController.protect,
  postcontroller.deletepost
);

router.get("/getAllPosts", authController.protect, postcontroller.getAllPosts);
router.patch(
  "/updatePost/:id",
  authController.protect,
  postcontroller.updatePost
);
router.get("/getMyPosts", authController.protect, postcontroller.getMyPosts);
module.exports = router;
