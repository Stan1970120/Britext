import Wishlist from "../models/Wishlist.js";

/**
 * POST /api/wishlist
 */
export const toggleWishlist = async (req, res) => {
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

  const exists = wishlist.books.some(
    (id) => id.toString() === bookId
  );

  wishlist.books = exists
    ? wishlist.books.filter((id) => id.toString() !== bookId)
    : [...wishlist.books, bookId];

  await wishlist.save();
  res.json(wishlist);
};

/**
 * GET /api/wishlist
 */
export const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate("books");

  res.json(wishlist);
};
