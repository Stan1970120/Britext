// routes/adminRoutes.js
import express from "express";
import {
  getTotalBooks,
  getTotalOrders,
  getActiveUsers,
  getRevenue,
  getRecentActivities,
  getBooks,
  uploadBook,
  getOrders,
  getAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

// Define routes
router.get("/books/total", getTotalBooks);
router.get("/orders/total", getTotalOrders);
router.get("/users/active", getActiveUsers);
router.get("/revenue", getRevenue);
router.get("/activities", getRecentActivities);
router.get("/books", getBooks);
router.post("/books", uploadBook);
router.get("/orders", getOrders);
router.get("/analytics", getAnalytics);

export default router;