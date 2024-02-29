exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    // If user is logged in, proceed to the next middleware or route handler
    return next();
  } else {
    // If user is not logged in, redirect to the login page
    return res.redirect("/login");
  }
};
