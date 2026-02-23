import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';
import Review from '../models/Review.js';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* --------------------------- DASHBOARD & ADMIN --------------------------- */

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

export const getAdminBooks = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const book = await PublishBook.findById(id);
      return res.json(book);
    }
    const books = await PublishBook.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) { res.status(500).json({ message: "Error fetching books" }); }
};

/* --------------------------- BOOK MANAGEMENT --------------------------- */

// ✅ UPDATED: Removed Manuscript requirement
export const createBook = async (req, res) => {
  try {
    const { title, description, author, estimatedPages, price } = req.body;
    const coverFile = req.files?.['cover']?.[0];

    let parsedChapters = [];
    if (req.body.chapters) {
      try { 
        parsedChapters = JSON.parse(req.body.chapters); 
      } catch (e) { 
        console.error("Chapter parse error:", e); 
      }
    }

    const newBook = new PublishBook({
      title,
      author: author || "Admin",
      category: "Uncategorized", // Default until finalized
      summary: description, 
      price: price || 0,
      coverImage: coverFile ? coverFile.location : "", 
      manuscriptKey: "", // No PDF upload in this flow
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
    console.error("Create Book Error:", err);
    res.status(500).json({ success: false, message: "Failed to create book draft" });
  }
};

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

export const finalizePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, price } = req.body; // Category selection happens here
    
    const updatedBook = await PublishBook.findByIdAndUpdate(
      id,
      { category, price, status: 'published' },
      { new: true }
    );
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to publish book" });
  }
};

/* --------------------------- STORE FRONT --------------------------- */

export const getStoreBooks = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'published' };

    if (category && category !== "All Books") {
      query.category = category;
    }

    const books = await PublishBook.find(query)
      .select('-chapters.content')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (err) { 
    res.status(500).json({ message: "Error fetching store books" }); 
  }
};

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
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

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

/* --------------------------- SECURE READING --------------------------- */

export const getReaderView = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const hasPurchased = await Order.findOne({ 
      userId, 
      bookId: id, 
      paymentStatus: 'completed' 
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "You must purchase this book to read it." });
    }

    const book = await PublishBook.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (err) { 
    res.status(500).json({ message: "Error loading reader view" }); 
  }
};