const User = require("../models/userModal");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { signToken } = require("./authController");
const sendEmail = require("../utils/email");

const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedfields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

let signupData;
let otp;

exports.signup = catchAsync(async (req, res, next) => {
  signupData = req.body;
  if (req.file) {
    signupData = { ...req.body, photo: req.file.path };
  }

  // const newUser = new User.validate(req.body);

  otp = Math.floor(1000 + Math.random() * 9000).toString();

  const message = `your one time registration code is "${otp}"`;
  await sendEmail({
    email: req.body.email,
    subject: "your otp is valid for 10 min",
    message,
  });
  res.status(201).json({
    status: "success",
    message: "otp sent successfully",
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  if (req.params.otp === otp) {
    const newUser = await User.create(signupData);

    const token = signToken(newUser._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    newUser.password = undefined;

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } else {
    res.status(201).json({
      status: "success",
      message: "otp mismatch",
    });
  }
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.password) {
    return next(
      new AppError(
        "this route is not for password updates. please use updatePassword",
        400
      )
    );
  }
  const filteredbody = filterObj(req.body, "name", "email", "address");

  const user = await User.findByIdAndUpdate(req.user.id, filteredbody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 401));
  }
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("there is no user with this email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/user/resetPassword/${resetToken}`;

  const message = `forget your password? submit a patch request with your new password and password 
  confirm to ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "token send to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "there was an error sending the email. try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordRestExpires: { $gt: Date.now() },
  });
  //if token has not expired,abd there is user, set the new password
  if (!user) {
    return next(new AppError("token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordRestExpires = undefined;
  await user.save();
  //update changedPassswordAt property for user

  //log the user in, send jwt
  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("incorrect password", 401));
  }
  //if so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //log user in send jwt
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
