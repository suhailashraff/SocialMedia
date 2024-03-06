const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const commentRoute = require("./routes/commentRoute");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
require("./controllers/seeding");

dotenv.config({ path: "./config.env" });

// Connect to the database
connectDB();
const app = express();

// Middlewares
app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comment", commentRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

module.exports = app;
