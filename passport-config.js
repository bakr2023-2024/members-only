const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { User } = require("./models");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    try {
      if (!user) {
        done(null, false, { message: "incorrect email" });
        return;
      }
      if (!bcrypt.compareSync(password, user.password)) {
        done(null, false, { message: "incorrect password" });
        return;
      }
      done(null, user);
      return;
    } catch (err) {
      done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});
module.exports = passport;
