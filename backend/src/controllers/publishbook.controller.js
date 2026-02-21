import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Review from '../models/Review.js';

// ✅ Dashboard Stats
export const getStats = async (req, res) => {
  try {
    const books = await PublishBook.find() || [];
    const orders = await Order.find({ paymentStatus: 'completed' }).populate('bookId') || [];
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
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// ✅ Create Book (Handles initial Chapters, Headings, and Page Counts)
export const createBook = async (req, res) => {
  try {
    const { title, description, category, author, estimatedPages } = req.body;
    
    let parsedChapters = [];
    if (req.body.chapters) {
      try { parsedChapters = JSON.parse(req.body.chapters); } catch (e) { console.error(e); }
    }

    const coverImagePath = req.file ? req.file.path : "";

    const newBook = new PublishBook({
      title,
      author: author || "Admin",
      category: category || "Fiction",
      summary: description, 
      coverImage: coverImagePath,
      authorId: req.user?.id || req.user?._id,
      status: 'draft',
      estimatedPages: estimatedPages || 1,
      chapters: parsedChapters.map((ch, index) => ({
        title: ch.title || `Chapter ${index + 1}`,
        heading: ch.heading || "",
        content: ch.content || "",
        order: index + 1
      })) 
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create book" });
  }
};

// ✅ Update Chapters (Supports Heading and Order)
export const updateChapters = async (req, res) => {
  try {
    const { chapters, estimatedPages } = req.body;
    const { id } = req.params;

    const formattedChapters = chapters.map((ch, index) => ({
      title: ch.title,
      heading: ch.heading,
      content: ch.content,
      order: index + 1
    }));

    const updatedBook = await PublishBook.findByIdAndUpdate(
      id, 
      { chapters: formattedChapters, estimatedPages }, 
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to update chapters" });
  }
};

// ✅ Finalize Publish (FIXES THE RENDER ERROR)
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

// ✅ Rate Book
export const rateBook = async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Review.findOneAndUpdate({ bookId, userId }, { rating }, { upsert: true, new: true });

    const reviews = await Review.find({ bookId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const updatedBook = await PublishBook.findByIdAndUpdate(
      bookId,
      { rating: avgRating, numReviews: reviews.length },
      { new: true }
    );

    res.json({ success: true, rating: updatedBook.rating });
  } catch (err) {
    res.status(500).json({ message: "Rating failed" });
  }
};

// ✅ Store & Admin & Reader Views
export const getAdminBooks = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const book = await PublishBook.findById(id);
      return res.json(book);
    }
    const books = await PublishBook.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

export const getStoreBooks = async (req, res) => {
  try {
    const books = await PublishBook.find({ status: 'published' }).select('-chapters.content');
    res.json(books);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

export const getReaderView = async (req, res) => {
  try {
    const book = await PublishBook.findById(req.params.id);
    res.json(book);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};