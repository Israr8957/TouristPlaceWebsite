const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.get("/signup", userController.renderSignUpForm);

//post route
router.post("/signup", wrapAsync(userController.signUp));

//login get route
router.get("/login", userController.renderLoginForm);

//login post route
router.post(
  "/login",
  saveRedirectUrl, //middleware
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

//logout rout
router.get("/logout", userController.logout);

module.exports = router;
