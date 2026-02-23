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

// ... (getStats, createBook, updateChapters, finalizePublish, rateBook stay the same)

// ✅ Get Admin Books
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

// ✅ Store View with Category Filtering
export const getStoreBooks = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'published' };

    // If a category is provided and it's not "All Books", filter the results
    if (category && category !== "All Books") {
      query.category = category;
    }

    // We exclude chapter content here to keep the store listing lightweight
    const books = await PublishBook.find(query)
      .select('-chapters.content')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (err) { 
    res.status(500).json({ message: "Error fetching store books" }); 
  }
};

// ✅ Reader View (Secure: Check for ownership)
export const getReaderView = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    // Verify the user has a completed order for this book
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

// ✅ Secure Download (Secure: Check for ownership)
export const downloadBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    // 1. Verify Ownership
    const hasPurchased = await Order.findOne({ 
      userId, 
      bookId: id, 
      paymentStatus: 'completed' 
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "Access denied. Purchase required." });
    }

    const book = await PublishBook.findById(id);
    if (!book || !book.manuscriptKey) {
      return res.status(404).json({ message: "Manuscript file not found." });
    }

    // 2. Generate Presigned URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: book.manuscriptKey,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 900 });

    res.json({ downloadUrl: url });
  } catch (err) {
    console.error("Presigned URL error:", err);
    res.status(500).json({ message: "Could not generate download link." });
  }
};