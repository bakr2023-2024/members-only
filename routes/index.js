var express = require("express");
var router = express.Router();
const passport = require("../passport-config");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
router.get("/", (req, res) => {
  res.render("login", {
    error: req.session.messages ? req.session.messages[0] : "ss",
  });
});
router.get("/signup", (req, res) => {
  res.render("signup", {
    error: req.session.messages,
  });
});
router.post(
  "/login",
  body("username").isEmail().withMessage("please enter email"),
  body("password").notEmpty().withMessage("please enter password"),
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.render("login", { error: result.array().map((i) => i.msg) });
      return;
    }
    next();
  },
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureMessage: "invalid email or password",
  })
);
router.post(
  "/signup",
  body("firstName").trim().notEmpty().withMessage("invalid firstName"),
  body("lastName").trim().notEmpty().withMessage("invalid lastName"),
  body("username").custom(async (value) => {
    const user = await User.findOne({ username: value });
    if (user) throw new Error("email already used");
    else return true;
  }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password is at least 8 chars"),
  body("confPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("passwords don't match");
    else return true;
  }),
  async (req, res) => {
    const result = validationResult(req);
    console.log(result.array());
    if (!result.isEmpty()) {
      return res.render("signup", { error: result.array().map((i) => i.msg) });
    } else {
      const hash = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hash,
      });
      await user.save();
      res.redirect("/");
    }
  }
);
module.exports = router;
