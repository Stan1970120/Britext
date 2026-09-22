// backend/src/routes/userRoutes.js

import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET /api/me/books (or /api/users/me/books depending on server mounting)
router.get("/me/books", protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware after verifying token
    const userId = req.user?._id || req.user?.id;

    const user = await User.findById(userId).populate("purchasedBooks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      purchasedBooks: user.purchasedBooks || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:userId/books
router.get("/:userId/books", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("purchasedBooks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      purchasedBooks: user.purchasedBooks || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;