import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';

// ==========================================
// 1. ADMIN DASHBOARD LOGIC
// ==========================================

// GET STATS: For the dashboard cards
export const getStats = async (req, res) => {
  try {
    // Fetch all books and completed orders
    const books = await PublishBook.find() || [];
    const orders = await Order.find({ paymentStatus: 'completed' }).populate('bookId') || [];
    
    // Safely calculate revenue (handles cases where amountPaid might be missing)
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amountPaid || 0), 0);

    res.json({
      totalDrafts: books.filter(b => b.status === 'draft').length,
      liveStoreCount: books.filter(b => b.status === 'published').length,
      dailyRevenue: totalRevenue,
      // Prevent division by zero if there are no books
      conversionRate: books.length > 0 ? ((orders.length / books.length) * 100).toFixed(1) : 0,
      recentTransactions: orders.slice(-5).map(o => ({
          _id: o._id,
          // Use optional chaining to prevent crash if book was deleted
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

// GET ADMIN BOOKS: For the Draft/Published tabs
export const getAdminBooks = async (req, res) => {
  try {
    const { status } = req.query; 
    // If no status is provided, fetch all books
    const query = status ? { status } : {};
    
    const books = await PublishBook.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error("Fetch Admin Books Error:", err);
    res.status(500).json({ message: "Error fetching book list" });
  }
};

// ==========================================
// 2. MANUSCRIPT & EDITING LOGIC
// ==========================================

// CREATE BOOK: Initial Manuscript creation
export const createBook = async (req, res) => {
  try {
    if (!req.body.title) {
        return res.status(400).json({ message: "Book title is required" });
    }

    const newBook = new PublishBook({
      title: req.body.title,
      // Link the book to the admin who created it
      authorId: req.admin?.id || req.admin?._id,
      status: 'draft',
      chapters: [] // Initialize empty chapters array
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("Create Book Error:", err);
    res.status(500).json({ message: "Failed to create book draft", error: err.message });
  }
};

// UPDATE CHAPTERS: Saves editor content
export const updateChapters = async (req, res) => {
  try {
    const { chapters } = req.body;
    const { id } = req.params;

    const updatedBook = await PublishBook.findByIdAndUpdate(
      id,
      { chapters },
      { new: true }
    );

    if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
    }

    res.json(updatedBook);
  } catch (err) {
    console.error("Update Chapters Error:", err);
    res.status(500).json({ message: "Failed to save chapter content" });
  }
};

// ==========================================
// 3. PUBLISHING & STOREFRONT LOGIC
// ==========================================

// GET STORE BOOKS: For the public bookstore (Live books only)
export const getStoreBooks = async (req, res) => {
  try {
    // Exclude full chapter content for the list view to save bandwidth
    const books = await PublishBook.find({ status: 'published' }).select('-chapters.content');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Error fetching store books" });
  }
};

// FINALIZE PUBLISH: Price/Category/Live status
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

// READER VIEW: Protected view
export const getReaderView = async (req, res) => {
  try {
    const book = await PublishBook.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // If free, show everything
    if (book.price <= 0) return res.json(book);

    // Check user from verifyUser middleware (req.user)
    const userId = req.user?.id || req.user?._id; 
    if (!userId) return res.json(lockBookHelper(book)); 

    // Check if user has a completed order for this book
    const hasPaid = await Order.findOne({ 
      userId, 
      bookId: book._id, 
      paymentStatus: 'completed' 
    });

    if (!hasPaid) return res.json(lockBookHelper(book));

    res.json(book);
  } catch (err) {
    console.error("Reader View Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// HELPERS
// ==========================================

const lockBookHelper = (book) => {
  // Map through chapters and obscure the content field
  const lockedChapters = (book.chapters || []).map(ch => ({
    title: ch.title,
    order: ch.order,
    content: "LOCKED: Please purchase this book to access the full content."
  }));
  
  return { 
    ...book.toObject(), 
    chapters: lockedChapters, 
    isLocked: true 
  };
};