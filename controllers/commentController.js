const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Comment = require("../database/modals/commentModal");
const mongoose = require("mongoose");

exports.createcomment = catchAsync(async (req, res, next) => {
  const author = req.user.id;
  const text = req.body.text;
  const postId = req.params.postId;

  const comment = await Comment.create({ author, text, postId });
  return res.status(201).json({
    status: "Success",
    Message: "Comment Created",
    comment,
  });
});

exports.deletebyId = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;
  const deletedcomment = await Comment.findByIdAndDelete(commentId);
  if (!deletedcomment) {
    return next(new AppError("No comment found with that ID", 404));
  }

  return res.status(204).json({
    Status: "Success",
    deletedcomment,
  });
});
exports.GetAllCommentsbyPostId = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;

  const comments = await Comment.findById(postId);
  return res.status(200).json({
    Status: "Success",
    comment: comments,
  });
});

module.exports;
