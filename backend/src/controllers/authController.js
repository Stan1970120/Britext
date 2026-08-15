import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendEmail.js";

// Helper function to generate a 6-digit OTP code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, name, email, password, sex } = req.body;

    const fName = firstName || (name ? name.split(" ")[0] : "");
    const lName = lastName || (name ? name.split(" ").slice(1).join(" ") : "");

    if ((!fName && !name) || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 

        existingUser.password = await bcrypt.hash(password, 12);
        existingUser.otpCode = otpCode;
        existingUser.otpExpiresAt = otpExpiresAt;
        await existingUser.save();

        await sendOtpEmail(email, otpCode);

        return res.status(200).json({
          message: "Account already exists but unverified. Verification code resent.",
          requiresVerification: true,
          email,
        });
      }

      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await User.create({
      firstName: fName,
      lastName: lName,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
      otpCode,
      otpExpiresAt,
    });

    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: "Account created successfully. Verification code sent.",
      requiresVerification: true,
      email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * VERIFY OTP
 */
export const verifyOtp = async (req, res) => {
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
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Email verified successfully",
      token,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * RESEND OTP
 */
export const resendOtp = async (req, res) => {
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
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 
    await user.save();

    await sendOtpEmail(email, otpCode);

    res.status(200).json({ message: "Verification code resent successfully" });
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
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GOOGLE OAUTH SYNC (SIGN UP & SIGN IN WITH GOOGLE)
 */
export const googleSync = async (req, res) => {
  try {
    let { email, firstName, lastName, provider, token: bodyToken } = req.body;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const jwtToken = bearerToken || bodyToken;

    // Decode token if email isn't provided directly in payload
    if (!email && jwtToken) {
      try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const foundUser = await User.findById(decoded.id);
        if (foundUser) {
          return res.status(200).json({
            message: "Token session valid",
            token: jwtToken,
            user: {
              _id: foundUser._id,
              id: foundUser._id,
              firstName: foundUser.firstName,
              lastName: foundUser.lastName,
              email: foundUser.email,
              role: foundUser.role,
              isVerified: foundUser.isVerified,
            },
          });
        }
      } catch (err) {
        // Fallthrough if token verification fails
      }
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: firstName || "Google",
        lastName: lastName || "User",
        email,
        provider: provider || "google",
        isVerified: true,
        role: "user",
      });
    } else {
      if (!user.isVerified) {
        user.isVerified = true;
      }
      if (provider && user.provider === "local") {
        user.provider = provider;
      }
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google sync successful",
      token,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET CURRENT USER PROFILE / ME ENDPOINTS
 */
export const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};

/**
 * LOGOUT
 */
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully." });
};


/*
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendEmail.js";

// Helper function to generate a 6-digit OTP code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


export const register = async (req, res) => {
  try {
    const { firstName, lastName, name, email, password, sex } = req.body;

    const fName = firstName || (name ? name.split(" ")[0] : "");
    const lName = lastName || (name ? name.split(" ").slice(1).join(" ") : "");

    if ((!fName && !name) || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If account exists but wasn't verified, generate fresh OTP and allow update
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 

        existingUser.password = await bcrypt.hash(password, 12);
        existingUser.otpCode = otpCode;
        existingUser.otpExpiresAt = otpExpiresAt;
        await existingUser.save();

        await sendOtpEmail(email, otpCode);

        return res.status(200).json({
          message: "Account already exists but unverified. Verification code resent.",
          requiresVerification: true,
          email,
        });
      }

      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await User.create({
      firstName: fName,
      lastName: lName,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
      otpCode,
      otpExpiresAt,
    });

    // Send OTP via email
    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: "Account created successfully. Verification code sent.",
      requiresVerification: true,
      email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
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

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    // Issue Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Email verified successfully",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const resendOtp = async (req, res) => {
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
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 
    await user.save();

    await sendOtpEmail(email, otpCode);

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Check if user is verified
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
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleSync = async (req, res) => {
  try {
    const { email, firstName, lastName, provider } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: firstName || "Google",
        lastName: lastName || "User",
        email,
        provider: provider || "google",
        isVerified: true, // Google accounts are pre-verified
        role: "user",
      });
    } else {
      if (!user.isVerified) {
        user.isVerified = true;
      }
      if (provider && user.provider === "local") {
        user.provider = provider;
      }
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google sync successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully." });
};


/*
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendEmail.js";

// Helper function to generate a 6-digit OTP code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


export const register = async (req, res) => {
  try {
    const { firstName, lastName, name, email, password, sex } = req.body;

    const fName = firstName || (name ? name.split(" ")[0] : "");
    const lName = lastName || (name ? name.split(" ").slice(1).join(" ") : "");

    if ((!fName && !name) || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // If account exists but wasn't verified, generate fresh OTP and allow update
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 

        existingUser.password = await bcrypt.hash(password, 12);
        existingUser.otpCode = otpCode;
        existingUser.otpExpiresAt = otpExpiresAt;
        await existingUser.save();

        await sendOtpEmail(email, otpCode);

        return res.status(200).json({
          message: "Account already exists but unverified. Verification code resent.",
          requiresVerification: true,
          email,
        });
      }

      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await User.create({
      firstName: fName,
      lastName: lName,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
      otpCode,
      otpExpiresAt,
    });

    // Send OTP via email
    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: "Account created successfully. Verification code sent.",
      requiresVerification: true,
      email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const verifyOtp = async (req, res) => {
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

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    // Issue Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Email verified successfully",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const resendOtp = async (req, res) => {
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
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 
    await user.save();

    await sendOtpEmail(email, otpCode);

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Check if user is verified
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
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully." });
};

/*
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


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


export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out. Please log in again to see Admin stats." });
};
*/