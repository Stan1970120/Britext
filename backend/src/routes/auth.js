import express from "express";
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  googleSync,
  getProfile,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

// Authentication Endpoints
router.post("/register", register);
router.post("/signup", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Google Sync
router.post("/google-sync", googleSync);

// Profile Alias Endpoints (Fixes 404 on /profile and /me)
router.get("/profile", getProfile);
router.get("/me", getProfile);

// Logout
router.post("/logout", logout);

export default router;
/*
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

const router = express.Router();

// Helper function for consistent JWT generation
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


router.post("/google-sync", async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        isVerified: true,
        provider: "google",
      });
    }

    const token = generateToken(user);

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "user",
      },
      token,
    });
  } catch (error) {
    console.error("Google Sync Error:", error);
    return res.status(500).json({ message: "Server error during Google sync" });
  }
});

export default router;


/*
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();


router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

   
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// --- Facebook Routes ---
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router;
*/