import jwt from "jsonwebtoken";
import Book from "../models/Book.js";     // ❗ CRITICAL: Ensure these imports exist
import Cart from "../models/Cart.js";     // ❗ CRITICAL
import Wishlist from "../models/Wishlist.js"; // ❗ CRITICAL

/**
 * GET /api/books (Public Storefront)
 */
export const getBooks = async (req, res) => {
  try {
    const { category } = req.query;
    
    // 1. Manually identify user if token is present (Public route)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        // Ensure process.env.JWT_SECRET matches your login secret!
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        userId = decoded.id;
      } catch (err) {
        userId = null; // Token expired or invalid, continue as guest
      }
    }

    // 2. Build filter (Only show published)
    const filter = { status: "published" };
    if (category && category !== "All Books") {
      filter.category = category;
    }

    // 3. Fetch books
    const books = await Book.find(filter).sort({ createdAt: -1 });

    // 4. Fetch Cart/Wishlist only if logged in
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

    // 5. Enrich books for the UI
    const enrichedBooks = books.map((book) => {
      const bookObj = book.toObject();
      return {
        ...bookObj,
        // Frontend uses coverImage, but we add 'image' as a fallback
        image: bookObj.coverImage, 
        isInCart: cartBookIds.includes(book._id.toString()),
        isWishlisted: wishlistBookIds.includes(book._id.toString()),
      };
    });

    res.json(enrichedBooks);
  } catch (err) {
    console.error("Storefront Fetch Error Details:", err); // Log the actual error
    res.status(500).json({ message: "Failed to fetch books", error: err.message });
  }
};