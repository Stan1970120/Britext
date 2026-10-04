import express from "express";
import User from "../models/User.js";
// Ensure the model referenced in User.purchasedBooks schema is registered before populate
import "../models/publishbook.model.js"; 
import { protect } from "../middleware/adminMiddleware.js";

const router = express.Router();

// 1. GET /api/users/me/books MUST COME BEFORE /:userId/books
router.get("/me/books", protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId).populate({
      path: "purchasedBooks",
      // Handle fallback if model name in User schema is PublishBook or Book
      strictPopulate: false, 
    });

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

// 2. GET /api/users/:userId/books
router.get("/:userId/books", async (req, res) => {
  try {
    const { userId } = req.params;

    // Guard against literal "me" matching this route
    if (userId === "me") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID provided",
      });
    }

    const user = await User.findById(userId).populate({
      path: "purchasedBooks",
      strictPopulate: false,
    });

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