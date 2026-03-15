import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js"; // Note: Added .js extension

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
      profileFields: ["id", "emails", "name"], 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          if (!user.facebookId) {
            user.facebookId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          facebookId: profile.id,
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