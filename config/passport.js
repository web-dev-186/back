const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model"); // Adjust the path to your User model

passport.use(
  new GoogleStrategy({
          clientID:
        "557051405550-7tqk8f3us23mml5n63l7k1lnk0tqdpq4.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/auth/google/callback",
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          // Add any other user fields you need
        });
        await user.save();
      }

      done(null, { id: user.id, name: user.name }); // Include name in the user object passed to done()
    } catch (error) {
      done(error, false);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, { id: user.id, name: user.name }); // Include name in the user object passed to done()
  } catch (error) {
    done(error, false);
  }
});

module.exports = passport;
