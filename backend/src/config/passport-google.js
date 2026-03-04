const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Path to your Mongoose model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists by email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update googleId if they previously signed up with email
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // 2. Create new user if they don't exist
        user = await User.create({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          googleId: profile.id,
          // Generate a random string as password placeholder
          password: Math.random().toString(36).slice(-16),
          sex: "custom", 
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);