const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserControlleer");
const authController = require("../controllers/authController");
const postcontroller = require("../controllers/PostControllers");

router.get(
  "/getAllUsers",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getAllUsers
);
router.delete(
  "/deleteUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);
router.delete(
  "/deletepost/:id",
  authController.protect,
  postcontroller.deletePost
);

router.get("/getAllPosts", authController.protect, postcontroller.getAllPosts);
