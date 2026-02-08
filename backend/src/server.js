import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import path from "path"; 
import fs from "fs"; // Added to ensure uploads directory exists
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import publishBookRoutes from "./routes/publishbook.routes.js"; 

import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

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

/* =======================
    Static Folder Fix
======================= */
// This logic checks if uploads is in the root or src. 
// Render usually puts everything in /opt/render/project/src/
const uploadPath = fs.existsSync(path.join(__dirname, "../uploads"))
  ? path.join(__dirname, "../uploads")
  : path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadPath));
console.log(`📁 Static files being served from: ${uploadPath}`);

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
app.use("/api/auth", authRoutes);
app.use("/api/publishbook", publishBookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Britext API running 🚀");
});

// Global Error Handler to catch 500s and log them to Render console
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

/* =======================
    Server
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);