import Wishlist from "../models/Wishlist.js";
import PublishBook from "../models/publishbook.model.js";

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        books: [bookId],
      });
      return res.status(201).json(wishlist);
    }

    const exists = wishlist.books.some((id) => id.toString() === bookId);
    wishlist.books = exists
      ? wishlist.books.filter((id) => id.toString() !== bookId)
      : [...wishlist.books, bookId];

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Failed to update wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: "books",
        model: PublishBook // ✨ Points to the new model
      });

    res.json(wishlist || { books: [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};