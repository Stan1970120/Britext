import Book from "../models/Book.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";

/**
 * GET /api/books
 * Used by: book-store/page.tsx
 */
export const getBooks = async (req, res) => {
  try {
    const { category } = req.query;
    const userId = req.user?.id;

    const filter =
      category && category !== "All Books" ? { category } : {};

    const books = await Book.find(filter).sort({ createdAt: -1 });

    let cartBookIds = [];
    let wishlistBookIds = [];

    if (userId) {
      const cart = await Cart.findOne({ userId });
      const wishlist = await Wishlist.findOne({ userId });

      cartBookIds =
        cart?.items.map((item) => item.bookId.toString()) || [];

      wishlistBookIds =
        wishlist?.books.map((id) => id.toString()) || [];
    }

    const enrichedBooks = books.map((book) => ({
      ...book.toObject(),
      isInCart: cartBookIds.includes(book._id.toString()),
      isWishlisted: wishlistBookIds.includes(book._id.toString()),
    }));

    res.json(enrichedBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

/**
 * GET /api/books/:id
 * Used by: book-store/[id]/page.tsx
 */
export const getBookDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    const book = await Book.findById(req.params.id);

    if (!book)
      return res.status(404).json({ message: "Book not found" });

    let isInCart = false;
    let isWishlisted = false;

    if (userId) {
      const cart = await Cart.findOne({ userId });
      const wishlist = await Wishlist.findOne({ userId });

      isInCart = cart?.items.some(
        (item) => item.bookId.toString() === book._id.toString()
      );

      isWishlisted = wishlist?.books.some(
        (id) => id.toString() === book._id.toString()
      );
    }

    res.json({
      ...book.toObject(),
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
