var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const { User, Post } = require("../models");
const { ObjectId } = require("mongodb");
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.redirect("/");
};
router.get("/", isAuth, async (req, res) => {
  res.locals.isMember = req.user.memberStatus;
  res.locals.isAdmin = req.user.adminStatus;
  const posts = await Post.find().populate({
    path: "author",
    model: User,
    select: "username -_id",
  });
  res.render("home", {
    name: req.user.fullName,
    posts: posts,
  });
});
router.put("/:type", isAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.params.type === "member") user.memberStatus = !user.memberStatus;
  else user.adminStatus = !user.adminStatus;
  await user.save();
  return res.json(user);
});
router.post(
  "/",
  (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.redirect("/");
  },
  body("title").notEmpty().escape().withMessage("please enter a title"),
  body("text").notEmpty().escape().withMessage("please enter text"),
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) throw new Error("invalid post");
    else next();
  },
  async (req, res) => {
    try {
      const post = new Post({
        title: req.body.title,
        text: req.body.text,
        author: req.user._id,
      });
      await post.save();
      return res.json(post);
    } catch (err) {
      console.log(err);
    }
  }
);
router.get("/logout", isAuth, (req, res, next) => {
  req.logout((err) => {
    if (err) next(err);
    else res.redirect("/");
  });
});
router.delete("/:id", isAuth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  return res.json({ result: "deleted successfully" });
});
module.exports = router;
