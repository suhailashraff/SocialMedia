const { validationResult } = require("express-validator");
const Post = require("../models/PostModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createPost = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "fail", errors: errors.array() });
  }
  const { text } = req.body;
  const authorId = req.user.id;
  const newpost = await Post.create({
    ...req.body,
    author: authorId,
    images: images,
  });
  return res.status(201).json({
    status: "success",
    data: {
      post: newpost,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const deletedpost = await Post.findByIdAndDelete(req.params.id);
  if (!deletedpost) {
    return res.status(404).json({
      status: "fail",
      message: "There is no Post related to this ID",
    });
  }
  if (deletedpost.author === req.user.author)
    return res.status(204).json({
      status: "success",
      message: "Post deleted Successfully",
    });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const allPosts = await Post.find()
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
      select: "text createdAt author", // Select only the text, createdAt, and author fields of comments
      populate: {
        path: "author",
        select: "name", // Exclude _id field for comment authors
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
  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user.id },
    req.body,
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
  //const post = await Post.findOne({ _id: postId });
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
