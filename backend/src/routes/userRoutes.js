import express from "express";
import User from "../models/User.js";
import "../models/publishbook.model.js"; 

import { protect } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET /api/users/:userId/books
router.get("/:userId/books", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("purchasedBooks");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      purchasedBooks: user.purchasedBooks || [],
    });
  } catch (error) {
    console.error("Get purchased books error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchased books",
      error: error.message,
    });
  }
});

// GET /api/users/me/books 
router.get("/me/books", protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId).populate("purchasedBooks");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      purchasedBooks: user.purchasedBooks || [],
    });
  } catch (error) {
    console.error("Get purchased books error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchased books",
      error: error.message,
    });
  }
});

export default router;

/*
import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET /api/users/me/books
router.get("/me/books", protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId)
      .populate("purchasedBooks");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      purchasedBooks: user.purchasedBooks || [],
    });
  } catch (error) {
    console.error("Get purchased books error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchased books",
      error: error.message,
    });
  }
});

export default router;
*/