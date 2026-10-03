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