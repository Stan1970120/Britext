import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Helper to set the secure cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true, // Security: prevents client-side JS from reading the token
    secure: true,   // Required for HTTPS (Render/Vercel)
    sameSite: "none", // Required for cross-domain (Vercel -> Render)
    maxAge: 24 * 60 * 60 * 1000, // 1 day
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