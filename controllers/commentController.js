const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Comment = require("../models/commentModal");
const Post = require("../models/PostModal");

exports.createComment = catchAsync(async (req, res, next) => {
  const text = req.body.text;
  const postId = req.params.postId;
  const author = req.user.id;

  const comment = await Comment.create({ author, text, postId });

  console.log(comment);
  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $push: { comments: comment._id },
    },
    { new: true }
  );

  return res.status(201).json({
    status: "Success",
    message: "Comment Created",
    comment,
    post,
  });
});

exports.deleteById = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    return next(new AppError("No comment found with that ID", 404));
  }

  return res.status(204).json({
    status: "Success",
    message: "Comment deleted successfully",
  });
});

exports.getAllCommentsByPostId = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;

  const comments = await Comment.find({ postId });
  return res.status(200).json({
    status: "Success",
    comments,
  });
});
