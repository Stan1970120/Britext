import express from "express";
import {
  getBooks,
  getBookDetails,
  rateBook,
} from "../controllers/bookController.js";
import { protect } from "../middleware/adminMiddleware.js"; // This is your 'required' auth

const router = express.Router();

// Public (If you don't have an 'optional' middleware yet, remove it for now)
router.get("/", getBooks);
router.get("/:id", getBookDetails);

// Protected (Use 'protect' instead of 'authMiddleware.required')
router.post("/:id/rating", protect, rateBook);

export default router;