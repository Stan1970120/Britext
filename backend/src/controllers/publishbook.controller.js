import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';
import Review from '../models/Review.js';
import { S3Client } from "@aws-sdk/client-s3";

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
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

export const getAdminBooks = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const book = await PublishBook.findById(id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      return res.json(book);
    }
    const books = await PublishBook.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) { 
    res.status(500).json({ message: "Error fetching books" }); 
  }
};

/* --------------------------- BOOK MANAGEMENT --------------------------- */

export const createBook = async (req, res) => {
  try {
    const { title, description, author, estimatedPages, price, chaptersData, creationMode } = req.body;
    
    const files = req.files || [];
    const coverFile = files.find(f => f.fieldname === 'cover');
    const docFile = files.find(f => f.fieldname === 'docFile');
    const epubFile = files.find(f => f.fieldname === 'epubFile');

    let finalChapters = [];
    if (creationMode === "write" && chaptersData) {
      try {
        const parsedChapters = typeof chaptersData === 'string' ? JSON.parse(chaptersData) : chaptersData;
        finalChapters = parsedChapters.map((ch, index) => ({
          title: ch.title || `Chapter ${index + 1}`,
          heading: ch.heading || "",
          content: ch.content || "",
          illustrationUrl: "", 
          order: index + 1
        }));
      } catch (e) {
        console.error("Chapter JSON parse error:", e);
      }
    }

    const newBook = new PublishBook({
      title,
      author: author || "Admin",
      category: req.body.category || "Uncategorized", 
      summary: description, 
      price: Number(price) || 0,
      coverImage: coverFile ? coverFile.location : "", 
      manuscriptKey: docFile?.location || epubFile?.location || "", 
      authorId: req.user?.id || req.user?._id,
      status: 'draft',
      estimatedPages: Number(estimatedPages) || 1,
      chapters: finalChapters
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("CRITICAL CREATE BOOK ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
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
      illustrationUrl: "", 
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
    const { category, price, summary, author } = req.body; 
    
    const book = await PublishBook.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.category = category || book.category;
    book.price = price !== undefined ? Number(price) : book.price;
    book.summary = summary || book.summary; 
    book.author = author || book.author;
    book.status = 'published';

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to publish book", error: err.message });
  }
};

/* --------------------------- STORE FRONT & READING --------------------------- */

export const getStoreBooks = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'published' };
    
    // Safety check for category filtering
    if (category && category !== "All Books" && category !== "undefined") {
      query.category = category;
    }

    const books = await PublishBook.find(query)
      .select('-chapters.content') // Don't send heavy content to the store gallery
      .sort({ createdAt: -1 });
      
    res.json(books || []);
  } catch (err) { 
    console.error("Store Fetch Error:", err);
    res.status(500).json({ message: "Error fetching store books" }); 
  }
};

export const rateBook = async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Review.findOneAndUpdate({ bookId, userId }, { rating }, { upsert: true });

    const reviews = await Review.find({ bookId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const updatedBook = await PublishBook.findByIdAndUpdate(
      bookId,
      { rating: avgRating, numReviews: reviews.length },
      { new: true }
    );
    res.json({ success: true, rating: updatedBook.rating });
  } catch (err) { res.status(500).json({ message: "Rating failed" }); }
};

/**
 * ✨ FIXED: Added safety for public viewing
 */
export const getReaderView = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await PublishBook.findById(id);
    
    if (!book) return res.status(404).json({ message: "Book not found" });

    // If there is no user logged in, we only send basic info (No content/chapters)
    // This allows the Book Details page to load even for guests.
    if (!req.user) {
        const publicData = book.toObject();
        delete publicData.chapters; // Protect content from non-logged in users
        return res.json(publicData);
    }

    const userId = req.user.id || req.user._id;
    const hasPurchased = await Order.findOne({ userId, bookId: id, paymentStatus: 'completed' });

    // If user hasn't bought it, don't send the full content
    if (!hasPurchased) {
        const previewData = book.toObject();
        delete previewData.chapters; 
        return res.json(previewData);
    }

    res.json(book);
  } catch (err) { 
    console.error("Reader View Error:", err);
    res.status(500).json({ message: "Error loading book details" }); 
  }
};