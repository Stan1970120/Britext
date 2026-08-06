// backend/src/routes/authRoutes.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/adminMiddleware.js";
import { sendOtpEmail } from "../utils/sendEmail.js";
import { googleSync } from "../controllers/authController.js";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true, 
    secure: true,   
    sameSite: "none", 
    maxAge: 24 * 60 * 60 * 1000, 
  });
};

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If user registered before but didn't verify, send a new OTP
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        existingUser.password = await bcrypt.hash(password, 10);
        existingUser.otpCode = otpCode;
        existingUser.otpExpiresAt = otpExpiresAt;
        await existingUser.save();

        await sendOtpEmail(email, otpCode);

        return res.status(200).json({
          message: "Account unverified. A new verification code has been sent.",
          requiresVerification: true,
          email,
        });
      }

      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      provider: "local",
      isVerified: false,
      otpCode,
      otpExpiresAt,
    });

    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: "Account created successfully. Verification code sent.",
      requiresVerification: true,
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setTokenCookie(res, token);

    res.status(200).json({
      message: "Email verified successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const otpCode = generateOTP();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendOtpEmail(email, otpCode);

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.provider !== "local") {
      return res.status(400).json({ message: `Use ${user.provider} login` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.isVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setTokenCookie(res, token);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/google-sync (OAuth2 Google Sign In / Sign Up)
router.post("/google-sync", googleSync);

router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
});

router.post("/checkout", protect, (req, res) => {
  res.json({ message: `Checkout successful for user ${req.user.id}` });
});

router.get("/admin/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

export default router;


/*
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/adminMiddleware.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

const router = express.Router();


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true, 
    secure: true,   
    sameSite: "none", 
    maxAge: 24 * 60 * 60 * 1000, 
  });
};

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If user registered before but didn't verify, send a new OTP
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        existingUser.password = await bcrypt.hash(password, 10);
        existingUser.otpCode = otpCode;
        existingUser.otpExpiresAt = otpExpiresAt;
        await existingUser.save();

        await sendOtpEmail(email, otpCode);

        return res.status(200).json({
          message: "Account unverified. A new verification code has been sent.",
          requiresVerification: true,
          email,
        });
      }

      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      provider: "local",
      isVerified: false,
      otpCode,
      otpExpiresAt,
    });

    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: "Account created successfully. Verification code sent.",
      requiresVerification: true,
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setTokenCookie(res, token);

    res.status(200).json({
      message: "Email verified successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const otpCode = generateOTP();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendOtpEmail(email, otpCode);

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.provider !== "local") {
      return res.status(400).json({ message: `Use ${user.provider} login` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.isVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setTokenCookie(res, token); // ✨ Set the cookie
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
});


router.post("/checkout", protect, (req, res) => {
  res.json({ message: `Checkout successful for user ${req.user.id}` });
});


router.get("/admin/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

export default router;

/*

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Helper to set the secure cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true, 
    secure: true,   
    sameSite: "none", 
    maxAge: 24 * 60 * 60 * 1000, 
  });
};

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      provider: "local",
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setTokenCookie(res, token); // ✨ Set the cookie
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.provider !== "local") {
      return res.status(400).json({ message: `Use ${user.provider} login` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setTokenCookie(res, token); // ✨ Set the cookie
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✨ NEW: POST /api/auth/logout
// Use this to clear your old "user" session so you can log back in as "admin"
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// ✅ Checkout route (users must be logged in)
router.post("/checkout", protect, (req, res) => {
  res.json({ message: `Checkout successful for user ${req.user.id}` });
});

// ✅ Admin dashboard route (admins only)
router.get("/admin/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

export default router;
*/