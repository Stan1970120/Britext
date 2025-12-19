// routes/adminRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { getAdminDashboard } from "../controllers/adminController.js";

const router = express.Router();

/**
 * 🔐 PROTECT ALL ADMIN ROUTES
 * Order matters:
 * 1. User must be logged in (protect)
 * 2. User must be admin (adminOnly)
 */
router.use(protect, adminOnly);

// Combined dashboard
router.get("/dashboard", getAdminDashboard);

export default router;