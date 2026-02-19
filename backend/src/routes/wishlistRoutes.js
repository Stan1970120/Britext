import express from "express";
import { toggleWishlist, getWishlist } from "../controllers/wishlistController.js";
// ✅ FIXED: Changed path from adminMiddleware to authMiddleware
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.use(protect);
router.post("/", toggleWishlist);
router.get("/", getWishlist);

export default router;