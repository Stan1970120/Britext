import express from "express";
const router = express.Router();
import { rateBook, addToCart, toggleWishlist } from "../controllers/bookRatingsController.js";
import { protect } from "../middleware/authMiddleware.js";

// Rating and Wishlist strictly require login
router.post("/rate", protect, rateBook);
router.post("/wishlist", protect, toggleWishlist);

// Cart handling 
router.post("/cart", (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        return protect(req, res, next);
    }
    next();
}, addToCart);

export default router;