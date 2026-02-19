import express from "express";
import { addToCart, getCart } from "../controllers/cartController.js";
// ✅ FIXED: Changed path from adminMiddleware to authMiddleware
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.use(protect); // Ensures req.user is populated for the controllers
router.post("/", addToCart);
router.get("/", getCart);

export default router;