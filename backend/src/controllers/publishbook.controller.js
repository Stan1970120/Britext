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

export const createBook = async (req, res) => {
  console.log("CreateBook Request Received. Body:", req.body);
  console.log("Files Received:", req.files);
  
  try {
    const { title, description, author, estimatedPages, price, chaptersData, creationMode } = req.body;
    
    const files = req.files || [];
    const coverFile = files.find(f => f.fieldname === 'cover');
    const docFile = files.find(f => f.fieldname === 'docFile');
    const epubFile = files.find(f => f.fieldname === 'epubFile');

    let finalChapters = [];
    if (creationMode === "write" && chaptersData) {
      try {
        const parsedChapters = JSON.parse(chaptersData);
        
        finalChapters = parsedChapters.map((ch, index) => {
          const illustration = files.find(f => f.fieldname === `chapterIllustration_${index}`);
          return {
            title: ch.title || `Chapter ${index + 1}`,
            heading: ch.heading || "",
            content: ch.content || "",
            illustrationUrl: illustration ? illustration.location : "", 
            order: index + 1
          };
        });
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
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: err.message 
    });
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
      illustrationUrl: ch.illustrationUrl || "",
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

/**
 * ✅ UPDATED: Finalize & Publish
 * Handles the transition from draft to published and merges storefront data.
 */
export const finalizePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, price, summary, author } = req.body; 
    
    // 1. Fetch the existing draft
    const book = await PublishBook.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // 2. Update fields: prioritize new input, fallback to existing draft data
    book.category = category || book.category;
    book.price = price !== undefined ? Number(price) : book.price;
    book.summary = summary || book.summary; // Uses the written synopsis if new summary is blank
    book.author = author || book.author;
    book.status = 'published';

    // 3. Save the changes
    const updatedBook = await book.save();
    
    console.log(`Book "${updatedBook.title}" is now LIVE.`);
    res.json(updatedBook);
  } catch (err) {
    console.error("FINALIZE PUBLISH ERROR:", err);
    res.status(500).json({ message: "Failed to publish book", error: err.message });
  }
};

/* --------------------------- STORE FRONT & READING --------------------------- */

export const getStoreBooks = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'published' };
    if (category && category !== "All Books") query.category = category;

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

export const getReaderView = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const hasPurchased = await Order.findOne({ userId, bookId: id, paymentStatus: 'completed' });

    if (!hasPurchased) return res.status(403).json({ message: "Purchase required." });

    const book = await PublishBook.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) { res.status(500).json({ message: "Error loading reader view" }); }
};