const catchAsync = require("../utils/catchAsync");
const Post = require("../database/modals/PostModal");
const AppError = require("../utils/appError");

exports.createPost = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  const authorId = req.user.id;
  const newpost = await Post.create({ author: authorId, text: text });
  return res.status(201).json({
    status: "success",
    data: {
      post: newpost,
    },
  });
});

exports.deletepost = catchAsync(async (req, res, next) => {
  const deletedpost = await Post.findByIdAndDelete(req.params.id);

  if (!deletedpost) {
    return res.status(404).json({
      status: "Fail",
      message: "There is no Post related to this ID",
    });
  }

  return res.status(204).json({
    status: "Success",
    message: "Post deleted Successfully",
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const AllPosts = await Post.find();
  if (AllPosts.length < 1) {
    return next(new AppError("There is no Posts Yet...", 404));
  }

  return res.status(200).json({
    Status: "Success",
    Posts: AllPosts,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPost) {
    return next(new AppError("no task found for this user with this id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      updatedPost,
    },
  });
});

exports.getMyPosts = catchAsync(async (req, res, next) => {
  const myposts = await Post.find({ author: req.user.id });
  if (!myposts || myposts.length === 0) {
    return next(new AppError("There are no posts to show from your account"));
  }

  return res.status(200).json({
    status: "Success",
    posts: myposts,
  });
});
