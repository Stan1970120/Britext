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

export const getAdminBooks = async (req, res) => {
  try {
    const { status } = req.query; 
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

// UPDATED: Now supports Multer (req.file) and FormData (req.body)
export const createBook = async (req, res) => {
  try {
    // 1. With Multer, fields are in req.body. 
    // Ensure we check 'title' which is 'required' in your model.
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: "Book title is required" 
      });
    }

    // 2. Multer puts file info in req.file
    // We store the path. On Render, this will be 'uploads/filename'
    const coverImagePath = req.file ? req.file.path : "";

    const newBook = new PublishBook({
      title: title,
      summary: description, // Mapping frontend 'description' to model 'summary'
      coverImage: coverImagePath,
      authorId: req.admin?.id || req.admin?._id,
      status: 'draft',
      chapters: [] 
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("Create Book Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create book draft", 
      error: err.message 
    });
  }
};

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

export const getStoreBooks = async (req, res) => {
  try {
    const books = await PublishBook.find({ status: 'published' }).select('-chapters.content');
    res.json(books);
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
    console.error("Reader View Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// HELPERS
// ==========================================

const lockBookHelper = (book) => {
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