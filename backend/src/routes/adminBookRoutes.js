import express from "express";
import multer from "multer";
import {
  createBook,
  publishBook,
  addChapter,
  updateChapter,
  reorderChapters,
  getBooks,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* =========================
   📦 MULTER CONFIG
========================= */
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* =========================
   📚 BOOK MANAGEMENT
========================= */

/**
 * 📚 Get books (draft / published)
 * GET /api/admin/books?status=draft|published
 */
router.get("/books", protect, adminOnly, getBooks);

/**
 * 📝 Create book (DRAFT)
 * POST /api/admin/books
 */
router.post(
  "/books",
  protect,
  adminOnly,
  upload.single("cover"),
  createBook
);

/**
 * 🚀 Publish book
 * PATCH /api/admin/books/:id/publish
 */
router.patch(
  "/books/:id/publish",
  protect,
  adminOnly,
  publishBook
);

/* =========================
   📖 CHAPTER MANAGEMENT
========================= */

/**
 * ➕ Add chapter
 * POST /api/admin/books/:id/chapters
 */
router.post(
  "/books/:id/chapters",
  protect,
  adminOnly,
  addChapter
);

/**
 * ✏️ Update chapter
 * PUT /api/admin/books/:bookId/chapters/:chapterId
 */
router.put(
  "/books/:bookId/chapters/:chapterId",
  protect,
  adminOnly,
  updateChapter
);

/**
 * 🔃 Reorder chapters
 * PUT /api/admin/books/:id/chapters/reorder
 */
router.put(
  "/books/:id/chapters/reorder",
  protect,
  adminOnly,
  reorderChapters
);

export default router;
