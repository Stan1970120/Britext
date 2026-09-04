import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/adminMiddleware.js";

const router = express.Router();

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