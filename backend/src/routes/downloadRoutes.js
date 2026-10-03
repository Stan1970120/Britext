import express from "express";
import jwt from "jsonwebtoken";
import DownloadToken from "../models/DownloadToken.js";
import PublishBook from "../models/publishbook.model.js";
import User from "../models/User.js";

const router = express.Router();
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

// ORIGINAL EMAIL TOKEN CLAIM ROUTE
router.get("/secure-claim", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      error: "Missing identity assertion token asset.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenRecord = await DownloadToken.findOne({ token });

    if (!tokenRecord) {
      return res.status(410).json({
        error: "Download link does not exist or has expired.",
      });
    }

    if (tokenRecord.isUsed) {
      return res.status(403).json({
        error: "This secure download link has already been used.",
      });
    }

    if (!tokenRecord.bookIds || tokenRecord.bookIds.length === 0) {
      return res.status(404).json({
        error: "No books are associated with this download link.",
      });
    }

    const books = await PublishBook.find({
      _id: { $in: tokenRecord.bookIds },
    }).select("_id title author coverImage manuscriptKey");

    if (books.length === 0 || books.length !== tokenRecord.bookIds.length) {
      return res.status(404).json({
        error: "One or more purchased books could not be found.",
      });
    }

    tokenRecord.isUsed = true;
    await tokenRecord.save();

    return res.status(200).json({
      message: "Access Authorized. Token burned successfully.",
      downloadTargets: books.map((book) => ({
        id: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        manuscriptKey: book.manuscriptKey,
      })),
    });
  } catch (err) {
    console.error("Secure download claim error:", err);
    return res.status(401).json({
      error: "Invalid signature payload token context validation failed.",
    });
  }
});

// NEW DIRECT LIBRARY DOWNLOAD ROUTE (WEEKLY RATE LIMIT)
router.post("/user-claim", async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ error: "User ID and Book ID are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    // Locate book in purchased list
    const purchase = user.purchasedBooks.find(
      (item) =>
        item.bookId?.toString() === bookId.toString() ||
        item.toString() === bookId.toString() // fallback for legacy plain ObjectId records
    );

    if (!purchase) {
      return res.status(403).json({ error: "You have not purchased this book." });
    }

    const now = new Date();

    // Check weekly restriction
    if (purchase.lastDownloadedAt) {
      const timeElapsed = now - new Date(purchase.lastDownloadedAt);
      if (timeElapsed < ONE_WEEK_IN_MS) {
        const nextAvailable = new Date(
          new Date(purchase.lastDownloadedAt).getTime() + ONE_WEEK_IN_MS
        );
        return res.status(429).json({
          error: `Weekly download limit reached. Next download available on ${nextAvailable.toLocaleDateString()} at ${nextAvailable.toLocaleTimeString()}.`,
          nextAvailableDate: nextAvailable,
        });
      }
    }

    const book = await PublishBook.findById(bookId).select("manuscriptKey title");
    if (!book || !book.manuscriptKey) {
      return res.status(404).json({ error: "Book file manuscript unavailable." });
    }

    // Update download timestamp
    if (typeof purchase === "object" && "lastDownloadedAt" in purchase) {
      purchase.lastDownloadedAt = now;
    } else {
      // Migrate legacy string item to object format on the fly
      const index = user.purchasedBooks.indexOf(purchase);
      user.purchasedBooks[index] = {
        bookId,
        lastDownloadedAt: now,
        purchasedAt: new Date(),
      };
    }

    await user.save();

    return res.status(200).json({
      message: "Download granted.",
      downloadUrl: book.manuscriptKey,
      lastDownloadedAt: now,
    });
  } catch (err) {
    console.error("Direct download error:", err);
    return res.status(500).json({ error: "Failed to process download claim." });
  }
});

export default router;


/*
import express from "express";
import jwt from "jsonwebtoken";
import DownloadToken from "../models/DownloadToken.js";
import PublishBook from "../models/publishbook.model.js";

const router = express.Router();

router.get("/secure-claim", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      error: "Missing identity assertion token asset.",
    });
  }

  try {
    // Verify token cryptographic integrity and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the token exists in the database
    const tokenRecord = await DownloadToken.findOne({ token });

    if (!tokenRecord) {
      return res.status(410).json({
        error: "Download link does not exist or has expired.",
      });
    }

    // Prevent the same download token from being claimed twice
    if (tokenRecord.isUsed) {
      return res.status(403).json({
        error: "This secure download link has already been used.",
      });
    }

    // Make sure the token contains book IDs
    if (!tokenRecord.bookIds || tokenRecord.bookIds.length === 0) {
      return res.status(404).json({
        error: "No books are associated with this download link.",
      });
    }

    // Find the purchased books in the actual PublishBook collection
    const books = await PublishBook.find({
      _id: { $in: tokenRecord.bookIds },
    }).select("_id title author coverImage manuscriptKey");

    // Make sure all requested books were found
    if (books.length === 0) {
      return res.status(404).json({
        error: "The purchased books could not be found.",
      });
    }

    // Make sure every book in the token exists
    if (books.length !== tokenRecord.bookIds.length) {
      return res.status(404).json({
        error: "One or more purchased books could not be found.",
      });
    }

    // Only burn the token after the books have been successfully located
    tokenRecord.isUsed = true;
    await tokenRecord.save();

    return res.status(200).json({
      message: "Access Authorized. Token burned successfully.",
      downloadTargets: books.map((book) => ({
        id: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        manuscriptKey: book.manuscriptKey,
      })),
    });
  } catch (err) {
    console.error("Secure download claim error:", err);

    return res.status(401).json({
      error: "Invalid signature payload token context validation failed.",
    });
  }
});

export default router;
*/