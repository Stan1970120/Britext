import express from "express";
import {
  addToCart,
  getCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/adminMiddleware.js"; // This is your 'required' auth

const router = express.Router();

// All cart actions require login
router.use(protect);

// Add item to cart
router.post("/", addToCart);

// Get full cart (used by Cart page)
router.get("/", getCart);

export default router;
