import express from "express";
import {
  getBooks,
  getBookDetails,
  rateBook,
  downloadBook,
} from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js"; // Verify path to protect middleware

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookDetails);
router.post("/:id/rating", protect, rateBook);
router.get("/:id/download", protect, downloadBook);

export default router;

/*
import express from "express";
import {
  getBooks,
  getBookDetails,
  rateBook,
  downloadBook,
} from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js"; // Adjust path if needed

const router = express.Router();

// Fetch all books
router.get("/", getBooks);

// Fetch single book details
router.get("/:id", getBookDetails);

// Rate a book
router.post("/:id/rating", protect, rateBook);

// Download a book 
router.get("/:id/download", protect, downloadBook);

export default router;
*/