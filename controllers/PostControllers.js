const { validationResult } = require("express-validator");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Post = require("../models/PostModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModal");
const Comment = require("../models/commentModal");

exports.createPost = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "fail", errors: errors.array() });
  }
  let postBody = { ...req.body, author: req.user.id };
  if (req.files) {
    postBody = {
      ...req.body,
      author: req.user.id,
      image: req.files.map((file) => file.path),
    };
  }
  try {
    const newPost = await Post.create(postBody);

    return res.status(201).json({
      status: "success",
      data: {
        post: newPost,
      },
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(async (file) => {
        await unlinkAsync(file.path);
      });
    }
    return next(error);
  }
});

exports.deletePost = catchAsync(async (req, res, next) => {
  let deletedPost;
  if (req.user.role === "user") {
    deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id,
    });
  }
  if (req.user.role === "admin") {
    deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
    });
  }

  if (!deletedPost) {
    return res.status(404).json({
      status: "fail",
      message: "There is no Post related to this ID",
    });
  }
  deletedPost.image.forEach((photo) => {
    if (fs.existsSync(photo)) {
      fs.unlinkSync(photo);
    }
  });
  const deletedComment = await Comment.find({
    _id: { $in: deletedPost.comments },
  });
  await Comment.deleteMany({ _id: { $in: deletedPost.comments } });
  const replyIds = deletedComment.flatMap((comment) => comment.replyId);
  await Comment.deleteMany({ _id: { $in: replyIds } });

  return res.status(204).json({
    status: "success",
    message: "Post deleted Successfully",
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  let allPosts;
  if (req.user.role === "user") {
    const userWithPublicAccount = await User.find({ isPublic: true });
    const publicUserIds = userWithPublicAccount.map((user) => user._id);
    const allUserIds = [...publicUserIds, ...req.user.followers];

    allPosts = await Post.find({ author: { $in: allUserIds } })
      .populate({
        path: "author",
        select: "name", // Exclude _id field for the author
      })
      .populate({
        path: "likes",
        select: "name", // Select only the username of users who liked the post
      })
      .populate({
        path: "comments",
        select: "text createdAt author replyId", // Select only the text, createdAt, and author fields of comments
        populate: {
          path: "author",
          select: "name", // Exclude _id field for comment authors
        },
        populate: {
          path: "replyId",
          select: "-_id text author",
          populate: {
            path: "author",
            select: "-_id name",
          },
        },
      })
      .select("text likes dislikes comments"); // Exclude _id field from the query results
  }
  if (req.user.role === "admin") {
    allPosts = await Post.find();
  }
  if (allPosts.length < 1) {
    return next(new AppError("There are no posts yet...", 404));
  }

  // Calculate likes and dislikes counts for each post
  const postsWithCounts = allPosts.map((post) => ({
    ...post.toObject(), // Convert to plain JavaScript object
    likesCount: post.likes.length,
    dislikesCount: post.dislikes.length,
  }));

  return res.status(200).json({
    status: "success",
    posts: postsWithCounts,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "fail", errors: errors.array() });
  }
  let postBody = req.body;
  if (req.files) {
    postBody = { ...req.body, image: req.files.map((file) => file.path) };
  }
  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user.id },
    postBody,
    { new: true, runValidators: true }
  );
  if (!updatedPost) {
    return next(new AppError("No task found for this user with this ID", 404));
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
    status: "success",
    posts: myposts,
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("No Post found with this PostID", 404));
  }
  const userIdString = req.params.id.toString();

  if (post.likes.includes(userIdString)) {
    post.likes.pull(userIdString);
    await post.save();

    return res.status(201).json({
      status: "Success",
      message: "like Uncheck",
    });
  }

  if (post.dislikes.includes(userIdString)) {
    post.dislikes.pull(userIdString);
    post.likes.push(userIdString);
  } else {
    post.likes.push(userIdString);
  }

  await post.save();

  return res.status(200).json({
    status: "Success",
    message: "Post liked 👍",
  });
});

exports.dislikePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("No Post found with this PostID", 404));
  }
  const userIdString = req.params.id.toString();

  if (post.dislikes.includes(userIdString)) {
    post.dislikes.pull(userIdString);
    await post.save();
    return res.status(201).json({
      status: "Success",
      message: "dislike Uncheck",
    });
  }

  if (post.likes.includes(userIdString)) {
    post.likes.pull(userIdString);
    post.dislikes.push(userIdString);
  } else {
    post.dislikes.push(userIdString);
  }

  await post.save();

  return res.status(200).json({
    status: "Success",
    message: "Post Disliked 👎",
  });
});
