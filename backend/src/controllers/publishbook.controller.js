import PublishBook from '../models/publishbook.model.js';
import Order from '../models/publishbook_order.model.js';
import Review from '../models/Review.js';
import { S3Client } from "@aws-sdk/client-s3";

// ... (S3 Client config stays the same)

/* --------------------------- DASHBOARD & ADMIN --------------------------- */
// ... (getStats and getAdminBooks stay the same)

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
      const parsedChapters = JSON.parse(chaptersData);
      finalChapters = parsedChapters.map((ch, index) => ({
        title: ch.title || `Chapter ${index + 1}`,
        heading: ch.heading || "",
        content: ch.content || "",
        illustrationUrl: "", // ✨ Illustration logic removed
        order: index + 1
      }));
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
    console.error("CREATE BOOK ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* --------------------------- STORE FRONT & READING --------------------------- */

// 1. PUBLIC: For the Book Details page (No Chapters/Content)
export const getStoreBookDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // We exclude the full chapters content to protect your IP from being scraped
    const book = await PublishBook.findById(id).select('-chapters'); 
    
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Error loading book details" });
  }
};

// 2. PRIVATE: For the actual Reader (Requires Purchase)
export const getReaderView = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    
    const hasPurchased = await Order.findOne({ userId, bookId: id, paymentStatus: 'completed' });
    if (!hasPurchased) return res.status(403).json({ message: "Purchase required to read." });

    const book = await PublishBook.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) { 
    res.status(500).json({ message: "Error loading reader view" }); 
  }
};

// ... (getStoreBooks, rateBook, updateChapters, finalizePublish stay the same)