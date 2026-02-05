import jwt from "jsonwebtoken";
import Book from "../models/Book.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";

/**
 * GET /api/books (Public Storefront)
 */
export const getBooks = async (req, res) => {
  try {
    const { category } = req.query;
    
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        userId = null;
      }
    }

    const filter = { status: "published" };
    if (category && category !== "All Books") {
      filter.category = category;
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });

    let cartBookIds = [];
    let wishlistBookIds = [];

    if (userId) {
      const [cart, wishlist] = await Promise.all([
        Cart.findOne({ userId }),
        Wishlist.findOne({ userId })
      ]);
      cartBookIds = cart?.items.map((item) => item.bookId.toString()) || [];
      wishlistBookIds = wishlist?.books.map((id) => id.toString()) || [];
    }

    const enrichedBooks = books.map((book) => ({
      ...book.toObject(),
      image: book.coverImage, 
      isInCart: cartBookIds.includes(book._id.toString()),
      isWishlisted: wishlistBookIds.includes(book._id.toString()),
    }));

    res.json(enrichedBooks);
  } catch (err) {
    console.error("Storefront Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

/**
 * ✨ ADDED BACK: GET /api/books/:id (Public Details)
 */
export const getBookDetails = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, status: "published" });
    if (!book) return res.status(404).json({ message: "Book not found" });
    
    // You can add cart/wishlist logic here later if needed
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Error fetching book details" });
  }
};

/**
 * ✨ ADDED BACK: POST /api/books/:id/rating
 */
export const rateBook = async (req, res) => {
  try {
    const { rating } = req.body;
    const book = await Book.findByIdAndUpdate(req.params.id, { rating }, { new: true });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Error updating rating" });
  }
};