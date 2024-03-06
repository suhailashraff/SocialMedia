const User = require("../models/userModal");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const seedAdmin = catchAsync(async () => {
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    const newAdmin = new User({
      name: "mujeeb",
      email: "mujeebqayoom1@gmail.com",
      password: "123456789",
      passwordConfirm: "123456789",
      role: "admin",
    });

    await newAdmin.save();
    console.log("Admin user created successfully.");
  } else {
    console.log("Admin user already exists.");
  }
});

seedAdmin();
