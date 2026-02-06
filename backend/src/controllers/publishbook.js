import jwt from "jsonwebtoken";
import Book from "../models/Book.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";

/**
 * 📦 GET ADMIN BOOKS (List or Single)
 */
export const getAdminBooks = async (req, res) => {
  try {
    const { id } = req.params;

    // If an ID is provided, return the single book for the editor
    if (id) {
      const book = await Book.findById(id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      return res.json(book);
    }

    // Otherwise, return the list for the dashboard tabs
    const { status } = req.query;
    const filter = status ? { status } : {};
    const books = await Book.find(filter).sort({ createdAt: -1 });
    
    // Ensure we ALWAYS return an array (fixes .map error)
    res.json(Array.isArray(books) ? books : []);
  } catch (error) {
    res.status(500).json({ message: "Admin fetch failed", error: error.message });
  }
};

/**
 * 🛒 GET STORE BOOKS (Public Storefront)
 */
export const getStoreBooks = async (req, res) => {
  try {
    const { category } = req.query;
    
    // Auth-aware but not auth-required
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) { userId = null; }
    }

    const filter = { status: "published" };
    if (category && category !== "All Books") filter.category = category;

    const books = await Book.find(filter).sort({ createdAt: -1 });

    let cartBookIds = [];
    let wishlistBookIds = [];

    if (userId) {
      const [cart, wishlist] = await Promise.all([
        Cart.findOne({ userId }),
        Wishlist.findOne({ userId })
      ]);
      cartBookIds = cart?.items.map(item => item.bookId.toString()) || [];
      wishlistBookIds = wishlist?.books.map(id => id.toString()) || [];
    }

    const enrichedBooks = books.map((book) => ({
      ...book.toObject(),
      image: book.coverImage, 
      isInCart: cartBookIds.includes(book._id.toString()),
      isWishlisted: wishlistBookIds.includes(book._id.toString()),
    }));

    res.json(enrichedBooks);
  } catch (err) {
    res.status(500).json({ message: "Storefront fetch failed" });
  }
};

// ... keep your other controllers (getStats, createBook, updateChapters, etc.) here