import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", 
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 SET COOKIE: This allows the browser to remember you as an Admin
    res.cookie("token", token, {
      httpOnly: true, // Prevents XSS attacks
      secure: true,   // Required for HTTPS (Render/Vercel)
      sameSite: "none", // Critical for Cross-Domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      token, // Also sending it in JSON for your current frontend setup
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * LOGOUT 
 * This is the "Refresh" button for your session.
 */
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out. Please log in again to see Admin stats." });
};