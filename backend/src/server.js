import 'dotenv/config'; 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import path from "path"; 
import fs from "fs"; 
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import publishBookRoutes from "./routes/publishbook.routes.js"; 

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =======================
    Middleware
======================= */
app.use(
  cors({
    origin: ["http://localhost:3000", "https://britext.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); 
app.use(cookieParser()); 
app.use(express.json());

/* =======================
    Static Folder
======================= */
const uploadPath = fs.existsSync(path.join(__dirname, "../uploads"))
  ? path.join(__dirname, "../uploads")
  : path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadPath));

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
app.use("/api/publish-books", publishBookRoutes); 
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Britext API running 🚀");
});

app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);