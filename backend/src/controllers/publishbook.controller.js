import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';

// ==========================================
// 1. ADMIN DASHBOARD LOGIC
// ==========================================

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
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Error fetching dashboard stats", error: err.message });
  }
};

/**
 * ✨ UPDATED: Handles both listing ALL books and fetching ONE book by ID
 */
export const getAdminBooks = async (req, res) => {
  try {
    const { id } = req.params;
    
    // If an ID is provided in the URL, fetch that specific book
    if (id) {
      const book = await PublishBook.findById(id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      return res.json(book);
    }

    // Otherwise, handle list view with status filter
    const { status } = req.query; 
    const query = status ? { status } : {};
    const books = await PublishBook.find(query).sort({ createdAt: -1 });
    
    // Always return an array for .map() safety
    res.json(Array.isArray(books) ? books : []);
  } catch (err) {
    console.error("Fetch Admin Books Error:", err);
    res.status(500).json({ message: "Error fetching book data", error: err.message });
  }
};

// ==========================================
// 2. MANUSCRIPT & EDITING LOGIC
// ==========================================

export const createBook = async (req, res) => {
  try {
    const { title, description, category, author } = req.body;

    if (!title) return res.status(400).json({ success: false, message: "Book title is required" });

    const coverImagePath = req.file ? req.file.path : "";

    const newBook = new PublishBook({
      title,
      author: author || "Unknown Author",
      category: category || "Uncategorized",
      summary: description, 
      coverImage: coverImagePath,
      authorId: req.admin?.id || req.admin?._id,
      status: 'draft',
      chapters: [] 
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("Create Book Error:", err);
    res.status(500).json({ success: false, message: "Failed to create book draft", error: err.message });
  }
};

export const updateChapters = async (req, res) => {
  try {
    const { chapters } = req.body;
    const { id } = req.params;

    const updatedBook = await PublishBook.findByIdAndUpdate(id, { chapters }, { new: true });
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });

    res.json(updatedBook);
  } catch (err) {
    console.error("Update Chapters Error:", err);
    res.status(500).json({ message: "Failed to save chapter content" });
  }
};

// ==========================================
// 3. PUBLISHING & STOREFRONT LOGIC
// ==========================================

export const getStoreBooks = async (req, res) => {
  try {
    // Return published books with mapped 'image' field for frontend compatibility
    const books = await PublishBook.find({ status: 'published' }).select('-chapters.content');
    const enriched = books.map(b => ({
      ...b.toObject(),
      image: b.coverImage // Ensure frontend gets 'image'
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Error fetching store books" });
  }
};

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