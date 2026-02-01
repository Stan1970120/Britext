import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import path from "path"; // 1. Import path for folder handling

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
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

app.use(cookieParser()); 
app.use(express.json());

// 2. ✨ ADDED: Static folder for uploads
// This makes http://your-api.com/uploads/image.jpg accessible
app.use("/uploads", express.static("uploads")); 

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
 */
app.use("/api/publishbook", publishBookRoutes);
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