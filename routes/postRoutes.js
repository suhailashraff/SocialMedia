const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const postController = require("../controllers/PostControllers");

router.use(authController.protect);

router.route("/createpost").post(postController.createPost);

router.route("/deletepost/:id").delete(postController.deletePost);

router.route("/getAllPosts").get(postController.getAllPosts);

router.route("/updatePost/:id").patch(postController.updatePost);

router.route("/getMyPosts").get(postController.getMyPosts);

router.route("/likePost/:id").post(postController.likePost);

router.route("/dislikePost/:id").post(postController.dislikePost);

module.exports = router;
