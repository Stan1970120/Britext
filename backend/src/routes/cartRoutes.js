import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// All cart routes require authentication
router.use(protect); 

router.get("/", getCart);        
router.post("/", addToCart);      
router.delete("/:bookId", removeFromCart); 

export default router;