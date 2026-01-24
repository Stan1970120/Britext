import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // General admin stats/users
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
// ✨ Redundant adminBookRoutes removed to avoid 404/401 conflicts
import publishBookRoutes from "./routes/publishbook.routes.js"; 

// Middleware
import { protect } from "./middleware/adminMiddleware.js";

dotenv.config();

const app = express();

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

// ✅ Essential for verifyAdmin middleware to read req.cookies
app.use(cookieParser()); 
app.use(express.json());

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

// 2. Public / General Store
app.use("/api/books", bookRoutes);

// 3. User Specific (Auth Required)
app.use("/api/cart", protect, cartRoutes);
app.use("/api/wishlist", protect, wishlistRoutes);

/** * 🛠️ ADMIN & PUBLISHING SYSTEM
 * Consolidated into publishbook for Manuscript/Chapter management
 */

// ✨ Priority 1: Handles Stats, Chapter Editor, and Publishing
app.use("/api/publishbook", publishBookRoutes);

// ✨ Priority 2: General Admin (Revenue, User Management, etc.)
app.use("/api/admin", adminRoutes);

/* =======================
    Health Check
======================= */
app.get("/", (req, res) => {
  res.send("Prep Center API running 🚀");
});

/* =======================
    Server
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);