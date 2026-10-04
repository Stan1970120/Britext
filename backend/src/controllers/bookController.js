// backend/src/controllers/bookController.js

import Book from "../models/Book.js";
import User from "../models/User.js";

// Fetch all books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error in getBooks:", error);
    return res.status(500).json({ error: "Server error fetching books." });
  }
};

// Fetch single book details
export const getBookDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Error in getBookDetails:", error);
    return res.status(500).json({ error: "Server error fetching book details." });
  }
};

// Rate a book
export const rateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    // Check if user already reviewed
    const existingRatingIndex = book.ratings?.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      book.ratings[existingRatingIndex].rating = rating;
      if (review) book.ratings[existingRatingIndex].review = review;
    } else {
      book.ratings.push({ user: userId, rating, review });
    }

    // Recalculate average rating
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((sum, item) => sum + item.rating, 0);
    book.averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

    await book.save();

    return res.status(200).json({ message: "Rating submitted successfully.", book });
  } catch (error) {
    console.error("Error in rateBook:", error);
    return res.status(500).json({ error: "Server error submitting rating." });
  }
};

/**
 * Handle book download URL generation
 */
export const downloadBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "User authentication missing." });
    }

    // Check if the book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    // Check ownership/purchase status
    const user = await User.findById(userId);
    const hasPurchased = user?.purchasedBooks?.some(
      (pBookId) => pBookId.toString() === bookId
    );

    if (!hasPurchased) {
      return res.status(403).json({ error: "You must purchase this book to download it." });
    }

    // Serve the download URL (S3 presigned URL or direct file link)
    const downloadUrl = book.manuscriptUrl || book.downloadUrl;

    if (!downloadUrl) {
      return res.status(404).json({ error: "Download link unavailable for this book." });
    }

    return res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error("Error in downloadBook:", error);
    return res.status(500).json({ error: "Server error generating download link." });
  }
};