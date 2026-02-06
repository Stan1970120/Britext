import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Review from '../models/Review.js';

// ✅ Dashboard Stats
export const getStats = async (req, res) => {
  try {
    const books = await PublishBook.find() || [];
    const orders = await Order.find({ paymentStatus: 'completed' }).populate({
      path: 'bookId',
      model: PublishBook
    }) || [];
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amountPaid || 0), 0);

    res.json({
      totalDrafts: books.filter(b => b.status === 'draft').length,
      liveStoreCount: books.filter(b => b.status === 'published').length,
      dailyRevenue: totalRevenue,
      conversionRate: books.length > 0 ? ((orders.length / books.length) * 100).toFixed(1) : 0,
      recentTransactions: orders.slice(-5).map(o => ({
          _id: o._id,
          bookTitle: o.bookId?.title || "Deleted Book",
          amount: o.amountPaid,
          timestamp: o.purchasedAt
      }))
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

// ✅ Get Admin Books
export const getAdminBooks = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const book = await PublishBook.findById(id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      return res.json(book);
    }
    const { status } = req.query; 
    const query = status ? { status } : {};
    const books = await PublishBook.find(query).sort({ createdAt: -1 });
    res.json(Array.isArray(books) ? books : []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching book data" });
  }
};

// ✅ Create Book (Fixes the Render SyntaxError)
export const createBook = async (req, res) => {
  try {
    const { title, description, category, author } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Book title is required" });
    
    const coverImagePath = req.file ? req.file.path : "";

    const newBook = new PublishBook({
      title,
      author: author || "Unknown Author",
      category: category || "Fiction",
      summary: description, 
      coverImage: coverImagePath,
      authorId: req.admin?.id || req.admin?._id || req.user?.id,
      status: 'draft',
      chapters: [] 
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("Create Book Error:", err);
    res.status(500).json({ success: false, message: "Failed to create book draft" });
  }
};

// ✅ Update Chapters
export const updateChapters = async (req, res) => {
  try {
    const { chapters } = req.body;
    const { id } = req.params;
    const updatedBook = await PublishBook.findByIdAndUpdate(id, { chapters }, { new: true });
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to save chapter content" });
  }
};

// ✅ Store Books (Persistence logic for Hearts & Cart)
export const getStoreBooks = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'published' };
    if (category && category !== "All Books") query.category = category;

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
      isWishlisted: wishlistIds.includes(b._id.toString()),
      isInCart: cartIds.includes(b._id.toString()),
      rating: b.rating || 0,
      numReviews: b.numReviews || 0
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Error fetching store books" });
  }
};

// ✅ Finalize Publish
export const finalizePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await PublishBook.findByIdAndUpdate(
      id,
      { ...req.body, status: 'published' },
      { new: true }
    );
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to publish book" });
  }
};

// ✅ Rate Book (Persistence for Stars)
export const rateBook = async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Review.findOneAndUpdate(
      { bookId, userId },
      { rating },
      { upsert: true, new: true }
    );

    const reviews = await Review.find({ bookId });
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const updatedBook = await PublishBook.findByIdAndUpdate(
      bookId,
      { 
        rating: avgRating,
        numReviews: totalReviews 
      },
      { new: true }
    );

    res.json({ success: true, rating: updatedBook.rating, numReviews: updatedBook.numReviews });
  } catch (err) {
    res.status(500).json({ message: "Rating failed" });
  }
};

// ✅ Reader View
export const getReaderView = async (req, res) => {
  try {
    const book = await PublishBook.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.price <= 0) return res.json(book);

    const userId = req.user?.id || req.user?._id; 
    if (!userId) return res.json(lockBookHelper(book)); 

    const hasPaid = await Order.findOne({ 
      userId, 
      bookId: book._id, 
      paymentStatus: 'completed' 
    });

    if (!hasPaid) return res.json(lockBookHelper(book));
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const lockBookHelper = (book) => {
  const lockedChapters = (book.chapters || []).map(ch => ({
    title: ch.title,
    order: ch.order,
    content: "LOCKED"
  }));
  return { ...book.toObject(), chapters: lockedChapters, isLocked: true };
};