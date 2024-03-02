const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

router.use(authController.protect);

router.post("/createcomment/:postId", commentController.createComment);

router.delete("/deletebyId/:commentId", commentController.deleteById);

router.get("/CommentsbyPostId/:id", commentController.getAllCommentsByPostId);

router.patch("/updateComment/:id", commentController.updateComment);

router.post("/commentbyId/:postId", commentController.createComment);

router.post("/reply/:id", commentController.replyOnComment);

module.exports = router;
