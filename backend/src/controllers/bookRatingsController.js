import Book from "../models/Book.js";
import Cart from "../models/Cart.js"; 
import Wishlist from "../models/Wishlist.js"; 
import Rating from "../models/Rating.js"; 

// @desc    Add/Update Rating and return new average
export const rateBook = async (req, res) => {
  const { bookId, rating } = req.body;
  const userId = req.user._id;

  try {
    // 1. Update or Create user's specific rating record
    await Rating.findOneAndUpdate(
      { userId, bookId },
      { rating },
      { upsert: true, new: true }
    );

    // 2. Calculate new global average for this book
    const ratings = await Rating.find({ bookId });
    const avgRating = ratings.reduce((acc, item) => item.rating + acc, 0) / ratings.length;

    // 3. Update the main Book document with the new average
    const updatedBook = await Book.findByIdAndUpdate(
      bookId, 
      { rating: avgRating }, 
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      rating: updatedBook.rating,
      message: "Rating updated successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: "Rating failed", error: error.message });
  }
};

// @desc    Add to Cart (Handles Array logic in Cart Model)
export const addToCart = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user ? req.user._id : null; 

  try {
    if (!userId) {
      return res.status(200).json({ 
        guest: true, 
        message: "Guest user: Items should be persisted in localStorage" 
      });
    }

    // Check if item already exists in the user's cart array
    const cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(p => p.bookId.toString() === bookId);

      if (itemIndex > -1) {
        // Book exists, increment quantity
        cart.items[itemIndex].quantity += 1;
      } else {
        // Book does not exist, push to array
        cart.items.push({ bookId, quantity: 1 });
      }
      await cart.save();
      res.status(200).json({ success: true, cart });
    } else {
      // No cart for user, create new one
      const newCart = await Cart.create({
        userId,
        items: [{ bookId, quantity: 1 }]
      });
      res.status(201).json({ success: true, cart: newCart });
    }
  } catch (error) {
    res.status(500).json({ message: "Cart update failed", error: error.message });
  }
};

// @desc    Toggle Heart/Wishlist (Handles Array logic in Wishlist Model)
export const toggleWishlist = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user._id;

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create new wishlist if it doesn't exist
      await Wishlist.create({
        userId,
        books: [bookId]
      });
      return res.status(200).json({ isWishlisted: true });
    }

    const isBookAdded = wishlist.books.includes(bookId);

    if (isBookAdded) {
      // Remove book if it's already there (un-heart)
      await Wishlist.updateOne(
        { userId },
        { $pull: { books: bookId } }
      );
      res.status(200).json({ isWishlisted: false });
    } else {
      // Add book if it's not there (heart fill)
      await Wishlist.updateOne(
        { userId },
        { $addToSet: { books: bookId } }
      );
      res.status(200).json({ isWishlisted: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Wishlist toggle failed", error: error.message });
  }
};