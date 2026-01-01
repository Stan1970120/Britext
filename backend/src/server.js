// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminBookRoutes from "./routes/adminBookRoutes.js";

// Middleware
import { protect } from "./middleware/adminMiddleware.js";

dotenv.config();

const app = express();

/* =======================
    Middleware
======================= */

// 🌐 Updated CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://britext.vercel.app", // ✨ Added your new Vercel URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// This helps handle the "Preflight" handshake mentioned in your error log
app.options("*", cors()); 

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

// Auth
app.use("/api/auth", authRoutes);

// Books (guest + auth supported via optionalAuth in routes)
app.use("/api/books", bookRoutes);

// Cart (auth required)
app.use("/api/cart", protect, cartRoutes);

// Wishlist (auth required)
app.use("/api/wishlist", protect, wishlistRoutes);

// Admin (auth + adminOnly inside routes)
app.use("/api/admin", adminRoutes);

// Admin Book Management
app.use("/api/admin", adminBookRoutes);

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