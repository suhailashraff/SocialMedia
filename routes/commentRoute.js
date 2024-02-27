const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

router.use(authController.protect);

router.post("/createcomment/:postId", commentController.createComment);

router.delete("/deletebyId/:commentId", commentController.deleteById);

router.get("/CommentsbyPostId", commentController.getAllCommentsByPostId);

module.exports = router;
