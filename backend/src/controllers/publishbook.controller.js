import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';

// ==========================================
// 1. ADMIN DASHBOARD LOGIC
// ==========================================

// GET STATS: For the dashboard cards
export const getStats = async (req, res) => {
  try {
    const books = await PublishBook.find();
    const orders = await Order.find({ paymentStatus: 'completed' }).populate('bookId');
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.amountPaid, 0);

    res.json({
      totalDrafts: books.filter(b => b.status === 'draft').length,
      liveStoreCount: books.filter(b => b.status === 'published').length,
      dailyRevenue: totalRevenue,
      conversionRate: books.length > 0 ? ((orders.length / books.length) * 100).toFixed(1) : 0,
      recentTransactions: orders.slice(-5).map(o => ({
         _id: o._id,
         bookTitle: o.bookId?.title || "Unknown Book",
         amount: o.amountPaid,
         timestamp: o.purchasedAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

// GET ADMIN BOOKS: For the Draft/Published tabs
export const getAdminBooks = async (req, res) => {
  try {
    const { status } = req.query; 
    const books = await PublishBook.find({ status }).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Error fetching book list" });
  }
};

// ==========================================
// 2. MANUSCRIPT & EDITING LOGIC
// ==========================================

// CREATE BOOK: Initial Manuscript creation
export const createBook = async (req, res) => {
  try {
    const newBook = new PublishBook({
      title: req.body.title,
      status: 'draft' 
    });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to create book draft" });
  }
};

// UPDATE CHAPTERS: Saves editor content
export const updateChapters = async (req, res) => {
  try {
    const { chapters } = req.body;
    const updatedBook = await PublishBook.findByIdAndUpdate(
      req.params.id,
      { chapters },
      { new: true }
    );
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to save chapter content" });
  }
};

// ==========================================
// 3. PUBLISHING & STOREFRONT LOGIC
// ==========================================

// GET STORE BOOKS: For the public bookstore (Live books only)
export const getStoreBooks = async (req, res) => {
  try {
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

    if (book.price <= 0) return res.json(book);

    const userId = req.user?._id; 
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

// ==========================================
// HELPERS
// ==========================================

const lockBookHelper = (book) => {
  const lockedChapters = book.chapters.map(ch => ({
    title: ch.title,
    order: ch.order,
    content: "LOCKED: Please purchase this book to access the full content."
  }));
  
  return { 
    ...book._doc, 
    chapters: lockedChapters, 
    isLocked: true 
  };
};