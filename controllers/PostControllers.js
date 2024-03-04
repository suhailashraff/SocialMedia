const { validationResult } = require("express-validator");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Post = require("../models/PostModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModal");

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
  const post = await Post.findById(req.params.id);
  if (post.image) {
    post.image.forEach(async (imagePath) => {
      await unlinkAsync(imagePath);
    });
  }
  await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return res.status(404).json({
      status: "fail",
      message: "There is no Post related to this ID",
    });
  }
  return res.status(204).json({
    status: "success",
    message: "Post deleted Successfully",
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const userWithPublicAccount = await User.find({ isPublic: true });
  const publicUserIds = userWithPublicAccount.map((user) => user._id);
  const allUserIds = [...publicUserIds, ...req.user.followers];

  const allPosts = await Post.find({ author: { $in: allUserIds } })
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
  console.log(postId);
  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("No Post found with this PostID", 404));
  }

  if (post.likes.includes(req.user.id.toString())) {
    return next(new AppError("You have already liked this post", 400));
  }

  if (post.dislikes.includes(req.user.id.toString())) {
    post.dislikes.pull(req.user.id);
    post.likes.push(req.user.id);
  } else {
    post.likes.push(req.user.id);
  }

  await post.save();

  return res.status(200).json({
    status: "Success",
    message: "Post liked 👍",
  });
});

exports.dislikePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  console.log(postId);

  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("No Post found with this PostID", 404));
  }

  if (post.dislikes.includes(req.user.id.toString())) {
    return next(new AppError("You have already disliked this post", 400));
  }

  if (post.likes.includes(req.user.id.toString())) {
    post.likes.pull(req.user.id);
    post.dislikes.push(req.user.id);
  } else {
    post.dislikes.push(req.user.id);
  }

  await post.save();

  return res.status(200).json({
    status: "Success",
    message: "Post Disliked 🤦‍♂️",
  });
});
