import 'dotenv/config'; 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import path from "path"; 
import fs from "fs"; 
import { fileURLToPath } from "url";
//import passport from "passport";

//import "./config/passport-google.js";
//import "./config/passport-facebook.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import publishBookRoutes from "./routes/publishbook.routes.js"; 
import bookRatingsRoutes from "./routes/bookRatingsRoutes.js";
import subscribeRoutes from "./routes/subscribe.routes.js";
import commentRoutes from "./routes/comment.route.js";
import trendingRoutes from "./routes/trending.route.js";
import paymentRoutes from "./routes/paymentRoutes.js";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Middleware */

//  Added live domains to the whitelist
const allowedOrigins = [
  "http://localhost:3000", 
  "https://britext.vercel.app",
  "https://enjoyreads.com",     
  "https://www.enjoyreads.com"  
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); 
app.use(cookieParser()); 
app.use(express.json());
app.use(passport.initialize());

/* Static Folder */
const uploadPath = fs.existsSync(path.join(__dirname, "../uploads"))
  ? path.join(__dirname, "../uploads")
  : path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadPath));

/* Database */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB error:", err));

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/publish-books", publishBookRoutes); 
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/publish-books", bookRatingsRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Britext API running, Welcome to the world of books");
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);