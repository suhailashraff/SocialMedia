const mongoose = require("mongoose");
const Post = require("./PostModal"); // Assuming you have a Post model
const User = require("./userModal"); // Assuming you have a User model

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  replyId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
