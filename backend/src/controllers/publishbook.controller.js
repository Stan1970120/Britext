import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Review from '../models/Review.js'; 

// ... (getStats, getAdminBooks, createBook, updateChapters remain same as your snippet)

export const getStoreBooks = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'published' };
    if (category && category !== "All Books") query.category = category;

    // ✨ Added numReviews to the selection
    const books = await PublishBook.find(query).select('-chapters.content');
    
    const userId = req.user?.id;
    let wishlistIds = [];
    let cartIds = [];

    if (userId) {
      const wishlist = await Wishlist.findOne({ user: userId });
      wishlistIds = wishlist?.books.map(id => id.toString()) || [];
      
      const cart = await Cart.findOne({ userId });
      cartIds = cart?.items.map(item => item.bookId.toString()) || [];
    }

    const enriched = books.map(b => ({
      ...b.toObject(),
      image: b.coverImage,
      isWishlisted: wishlistIds.includes(b._id.toString()),
      isInCart: cartIds.includes(b._id.toString())
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Error fetching store books" });
  }
};

// ✨ Enhanced RateBook Logic with numReviews tracking
export const rateBook = async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Update or create user review
    await Review.findOneAndUpdate(
      { bookId, userId },
      { rating },
      { upsert: true, new: true }
    );

    // Recalculate Average and Count
    const reviews = await Review.find({ bookId });
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // Update the main book document with the new stats
    const updatedBook = await PublishBook.findByIdAndUpdate(
      bookId,
      { 
        rating: avgRating,
        numReviews: totalReviews // Syncing the count for the frontend
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      rating: updatedBook.rating, 
      numReviews: updatedBook.numReviews 
    });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ message: "Rating failed" });
  }
};

// ... (finalizePublish, getReaderView, lockBookHelper remain same)