import Book from "../models/Book.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";

/**
 * GET /api/books (Public Storefront)
 */
export const getBooks = async (req, res) => {
  try {
    const { category } = req.query;
    const userId = req.user?.id;

    // 1. CRITICAL: Only show books that are actually published
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
      // Ensure the frontend 'image' key maps to the database 'coverImage'
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
 * GET /api/books/:id (Public Details)
 */
export const getBookDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    // Ensure even details only show for published books
    const book = await Book.findOne({ _id: req.params.id, status: "published" });

    if (!book)
      return res.status(404).json({ message: "Book not found or not yet published" });

    let isInCart = false;
    let isWishlisted = false;

    if (userId) {
      const [cart, wishlist] = await Promise.all([
        Cart.findOne({ userId }),
        Wishlist.findOne({ userId })
      ]);

      isInCart = cart?.items.some(
        (item) => item.bookId.toString() === book._id.toString()
      );

      isWishlisted = wishlist?.books.some(
        (id) => id.toString() === book._id.toString()
      );
    }

    res.json({
      ...book.toObject(),
      image: book.coverImage,
      isInCart,
      isWishlisted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch book details" });
  }
};

/**
 * POST /api/books/:id/rating
 */
export const rateBook = async (req, res) => {
  try {
    const { rating } = req.body;
    
    // Safety check: Rating should be between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Failed to update rating" });
  }
};