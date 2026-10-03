import express from "express";
import {
  getBooks,
  getBookDetails,
  rateBook,
  downloadBook, 
} from "../controllers/bookController.js";
import { protect } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getBooks);
router.get("/:id", getBookDetails);

// Protected Routes
router.post("/:id/rating", protect, rateBook);
router.get("/:id/download", protect, downloadBook); // 2. Added secure download route

export default router;