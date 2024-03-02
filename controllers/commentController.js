const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Comment = require("../models/commentModal");
const Post = require("../models/PostModal");

exports.createComment = catchAsync(async (req, res, next) => {
  const text = req.body.text;
  const postId = req.params.postId;
  const author = req.user.id;
  const comment = await Comment.create({ author, text, postId });
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: comment._id } },
    { new: true }
  );

  return res.status(201).json({
    status: "Success",
    message: "Comment Created",
    comment,
    updatedPost,
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
  const postId = req.params.id;

  const comments = await Comment.find({ postId: postId });
  return res.status(200).json({
    status: "Success",
    comments,
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const updatedComment = await Comment.findOneAndUpdate(
    { _id: req.params.id, author: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedComment) {
    return next(
      new AppError("No comment found for this user with this ID", 404)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      updatedComment,
    },
  });
});

exports.replyOnComment = catchAsync(async (req, res, next) => {
  // const comment = await Comment.findById(req.params.id);
  const reply = await Comment.create({
    author: req.user.id,
    postId: req.params.id,
    // commentId: req.params.comId,
    text: req.body.text,
  });
  await Comment.findByIdAndUpdate(
    req.params.id,
    { $push: { replyId: reply._id } },
    { new: true }
  );

  return res.status(201).json({
    Status: "Success",
    Message: "Replied Successfully",
    YourComment: reply,
  });
});
