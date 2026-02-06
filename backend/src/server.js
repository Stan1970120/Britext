import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import path from "path"; 
import { fileURLToPath } from "url"; // Needed for static paths in ESM

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import publishBookRoutes from "./routes/publishbook.routes.js"; 

// Middleware
// ✅ FIXED: Importing from authMiddleware.js instead of adminMiddleware.js
import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// Set up __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =======================
    Middleware
======================= */

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://britext.vercel.app", 
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); 

app.use(cookieParser()); 
app.use(express.json());

// ✅ FIXED: Static folder setup for Render (Linux)
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 

/* =======================
    Database
======================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* =======================
    Routes
======================= */

// 1. Authentication
app.use("/api/auth", authRoutes);

// 2. Publishing & Store System
app.use("/api/publishbook", publishBookRoutes);

// 3. User Specific
// Note: We don't need 'protect' here if your route files already use router.use(protect)
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

// 4. Admin Panel
app.use("/api/admin", adminRoutes);

/* =======================
    Health Check
======================= */
app.get("/", (req, res) => {
  res.send("Britext API running 🚀");
});

/* =======================
    Server
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);