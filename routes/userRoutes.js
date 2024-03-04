const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserControlleer");
const authController = require("../controllers/authController");
const uploadUsingMulter = require("../utils/uploadUsingMulter");

router.post(
  "/signup",
  uploadUsingMulter.uploadUserPhotos,
  userController.signup
);
router.post("/verifyOtp/:otp", userController.verifyOtp);

// router.get("/getAllUsers", userController.getAllUsers);
router.get("/getuser", authController.protect, userController.getUser);
router.patch(
  "/updateUser",
  authController.protect,
  uploadUsingMulter.uploadPostPhotos,
  userController.updateUser
);
// router.get("/", Middlewares.requireLogin, userController.home);
router.delete("/deleteUser", authController.protect, userController.deleteUser);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logout);
router.post("/forgetPassword", userController.forgetPassword);
router.patch("/resetPassword/:token", userController.resetPassword);
router.patch(
  "/updatePassword",
  authController.protect,
  userController.updatePassword
);

module.exports = router;
