import Wishlist from "../models/Wishlist.js";
import PublishBook from "../models/publishbook.model.js";

export const toggleWishlist = async (req, res) => {
  try {
    // ✨ FIX: Use optional chaining and check both id and _id
    const userId = req.user?.id || req.user?._id;
    const { bookId } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    if (!bookId) return res.status(400).json({ message: "Book ID is required" });

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        books: [bookId],
      });
      return res.status(201).json(wishlist);
    }

    // Use .toString() to ensure comparison works between ObjectIds and Strings
    const exists = wishlist.books.some((id) => id?.toString() === bookId);
    
    wishlist.books = exists
      ? wishlist.books.filter((id) => id?.toString() !== bookId)
      : [...wishlist.books, bookId];

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    console.error("❌ Wishlist Toggle Error:", err); // Log this for Render logs
    res.status(500).json({ message: "Failed to update wishlist", error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "books",
        model: "PublishBook" // Use string name to be safe
      });

    res.json(wishlist || { books: [] });
  } catch (err) {
    console.error("❌ Wishlist Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};