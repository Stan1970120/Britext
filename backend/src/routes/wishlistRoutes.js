import express from "express";
import {
  toggleWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/adminMiddleware.js"; // This is your 'required' auth

const router = express.Router();

// All wishlist actions require login
router.use(protect);

// Toggle wishlist
router.post("/", toggleWishlist);

// Fetch wishlist
router.get("/", getWishlist);

export default router;
