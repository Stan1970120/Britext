// routes/adminRoutes.js
import express from "express";
import {
  /* ================= DASHBOARD ================= */
  getTotalBooks,
  getTotalOrders,
  getActiveUsers,
  getRevenue,
  getRecentActivities,
  getOrders,
  getAnalytics,

  /* ================= BOOK MANAGEMENT ================= */
  getBooks,
  createBook,
  // updateBook, // Removed because missing in controller
  // deleteBook, // Removed because missing in controller
  publishBook,
  // unpublishBook, // Removed because missing in controller

  /* ================= CHAPTER MANAGEMENT ================= */
  addChapter,
  updateChapter,
  // deleteChapter, // Removed because missing in controller
  reorderChapters,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/adminMiddleware.js";
// adminRoutes.js

const router = express.Router();

/* ======================================================
   🔐 PROTECTED ADMIN ROUTES
====================================================== */
router.use(protect, adminOnly);

/* ================= DASHBOARD ================= */
router.get("/books/total", getTotalBooks);
router.get("/orders/total", getTotalOrders);
router.get("/users/active", getActiveUsers);
router.get("/revenue", getRevenue);
router.get("/activities", getRecentActivities);
router.get("/orders", getOrders);
router.get("/analytics", getAnalytics);

/* ================= BOOKS ================= */

/**
 * GET /api/admin/books?status=draft|published
 */
router.get("/books", getBooks);

/**
 * POST /api/admin/books
 */
router.post("/books", createBook);

// Removed router.put("/books/:bookId", updateBook);
// Removed router.delete("/books/:bookId", deleteBook);

/**
 * PATCH /api/admin/books/:bookId/publish
 */
router.patch("/books/:bookId/publish", publishBook);

// Removed router.patch("/books/:bookId/unpublish", unpublishBook);

/* ================= CHAPTERS ================= */

/**
 * POST /api/admin/books/:bookId/chapters
 */
router.post("/books/:bookId/chapters", addChapter);

/**
 * PUT /api/admin/books/:bookId/chapters/:chapterIndex
 */
router.put(
  "/books/:bookId/chapters/:chapterIndex",
  updateChapter
);

// Removed router.delete("/books/:bookId/chapters/:chapterIndex", deleteChapter);

/**
 * PATCH /api/admin/books/:bookId/chapters/reorder
 */
router.patch(
  "/books/:bookId/chapters/reorder",
  reorderChapters
);

export default router;