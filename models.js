const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  memberStatus: {
    type: Boolean,
    default: false,
  },
  adminStatus: {
    type: Boolean,
    default: false,
  },
});
userSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});
const User = mongoose.model("users", userSchema);
const postSchema = new mongoose.Schema({
  title: String,
  timestamp: {
    type: String,
    default: new Date().toString(),
  },
  text: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const Post = mongoose.model("posts", postSchema);
module.exports = { User, Post };
