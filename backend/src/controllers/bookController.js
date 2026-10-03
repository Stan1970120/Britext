import Book from "../models/Book.js";
import User from "../models/User.js";

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