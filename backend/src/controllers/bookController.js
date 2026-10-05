import PublishBook from "../models/publishbook.model.js";
import User from "../models/User.js";

// Fetch all published books
export const getBooks = async (req, res) => {
  try {
    const books = await PublishBook.find({});
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error in getBooks:", error);
    return res.status(500).json({ error: "Server error fetching books." });
  }
};

// Fetch books owned/purchased by a specific user
export const getUserBooks = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate({
      path: "purchasedBooks",
      model: PublishBook,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(user.purchasedBooks || []);
  } catch (error) {
    console.error("Error in getUserBooks:", error);
    return res.status(500).json({ error: "Server error fetching user books." });
  }
};

// Fetch single book details
export const getBookDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await PublishBook.findById(id);
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

    const book = await PublishBook.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    const existingRatingIndex = book.ratings?.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      book.ratings[existingRatingIndex].rating = rating;
      if (review) book.ratings[existingRatingIndex].review = review;
    } else {
      if (!book.ratings) book.ratings = [];
      book.ratings.push({ user: userId, rating, review });
    }

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

    // Look up in PublishBook collection
    const book = await PublishBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    const user = await User.findById(userId);

    // Check ownership
    const hasPurchased = user?.purchasedBooks?.some((pBook) => {
      const pId = pBook._id ? pBook._id.toString() : pBook.toString();
      return pId === bookId.toString();
    });

    if (!hasPurchased) {
      return res.status(403).json({ error: "You must purchase this book to download it." });
    }

    const downloadUrl = book.manuscriptUrl || book.downloadUrl || book.pdfUrl || book.fileUrl;

    if (!downloadUrl) {
      return res.status(404).json({ error: "Download link unavailable for this book." });
    }

    return res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error("Error in downloadBook:", error);
    return res.status(500).json({ error: "Server error generating download link." });
  }
};


/*
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

// Fetch books owned/purchased by a specific user
export const getUserBooks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Populate purchasedBooks so the frontend receives title, author, coverImage, etc.
    const user = await User.findById(userId).populate("purchasedBooks");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(user.purchasedBooks || []);
  } catch (error) {
    console.error("Error in getUserBooks:", error);
    return res.status(500).json({ error: "Server error fetching user books." });
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

    const existingRatingIndex = book.ratings?.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      book.ratings[existingRatingIndex].rating = rating;
      if (review) book.ratings[existingRatingIndex].review = review;
    } else {
      book.ratings.push({ user: userId, rating, review });
    }

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


export const downloadBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "User authentication missing." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    const user = await User.findById(userId);
    
    // Check if user owns the book (handles both ObjectId array & populated object array)
    const hasPurchased = user?.purchasedBooks?.some((pBook) => {
      const pId = pBook._id ? pBook._id.toString() : pBook.toString();
      return pId === bookId.toString();
    });

    if (!hasPurchased) {
      return res.status(403).json({ error: "You must purchase this book to download it." });
    }

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
*/