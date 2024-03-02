const multer = require("multer");

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `user-${uniqueSuffix}.${ext}`);
  },
});

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/posts");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `post-${uniqueSuffix}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image!please upload only images", 400), false);
  }
};

const uploadUser = multer({
  storage: userStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhotos = uploadUser.single("photo");

const uploadPost = multer({
  storage: postStorage,
  fileFilter: multerFilter,
});

exports.uploadPostPhotos = uploadPost.array("image", 10);
