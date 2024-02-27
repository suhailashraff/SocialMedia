const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

router.post(
  "/createcomment/:postId",
  authController.protect,
  commentController.createcomment
);
router.delete(
  "/deletebyId/:commentId",
  authController.protect,
  commentController.deletebyId
);

router.get(
  "/CommentsbyPostId",
  authController.protect,
  commentController.GetAllCommentsbyPostId
);
module.exports = router;
