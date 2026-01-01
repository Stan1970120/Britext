import Book from "../models/Book.js";
import User from "../models/User.js";
import Order from "../models/order.js";

/* =========================
   📊 DASHBOARD METRICS
========================= */

/** 📊 Total Books */
export const getTotalBooks = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    res.json({ totalBooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 📦 Total Orders */
export const getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 👥 Active Users */
export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ isActive: true });
    res.json({ activeUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 💰 Revenue */
export const getRevenue = async (req, res) => {
  try {
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);

    res.json({ revenue: revenueAgg[0]?.totalRevenue || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 🕒 Recent Activities */
export const getRecentActivities = async (req, res) => {
  try {
    const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(5);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    const activities = [
      ...recentBooks.map((b) => ({
        type: "book",
        message: `New book created: ${b.title}`,
        timestamp: b.createdAt,
      })),
      ...recentOrders.map((o) => ({
        type: "order",
        message: `Order placed: ₦${o.total}`,
        timestamp: o.createdAt,
      })),
      ...recentUsers.map((u) => ({
        type: "user",
        message: `New user signed up: ${u.name}`,
        timestamp: u.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   📚 BOOK MANAGEMENT (KDP STYLE)
========================= */

/** 📚 Get All Books (Admin) */
export const getBooks = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { status } : {};
    const books = await Book.find(filter).sort({ createdAt: -1 });

    res.json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 📝 Create Book (DRAFT) */
export const createBook = async (req, res) => {
  try {
    const book = await Book.create({
      ...req.body,
      status: "draft",
      createdBy: req.user.id,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 🚀 Publish Book */
export const publishBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.status === "published") {
      return res
        .status(400)
        .json({ message: "Book is already published" });
    }

    if (!book.chapters || book.chapters.length === 0) {
      return res.status(400).json({
        message: "Cannot publish a book without chapters",
      });
    }

    book.status = "published";
    book.publishedAt = new Date();
    await book.save();

    res.json({ message: "Book published successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   📖 CHAPTER MANAGEMENT
========================= */

/** ➕ Add Chapter */
export const addChapter = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Chapter title and content are required",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.status === "published") {
      return res
        .status(400)
        .json({ message: "Cannot edit a published book" });
    }

    const order = book.chapters.length;

    book.chapters.push({
      title,
      content, // TipTap JSON
      order,
    });

    await book.save();

    res.status(201).json({
      message: "Chapter added successfully",
      chapters: book.chapters,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** ✏️ Update Chapter */
export const updateChapter = async (req, res) => {
  try {
    const { bookId, chapterIndex } = req.params;
    const { title, content } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const chapter = book.chapters[chapterIndex];

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (book.status === "published") {
      return res
        .status(400)
        .json({ message: "Cannot edit a published book" });
    }

    if (title) chapter.title = title;
    if (content) chapter.content = content;

    await book.save();

    res.json({
      message: "Chapter updated successfully",
      chapter,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 🔀 Reorder Chapters */
export const reorderChapters = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({
        message: "Order must be an array of indexes",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.status === "published") {
      return res
        .status(400)
        .json({ message: "Cannot reorder a published book" });
    }

    if (order.length !== book.chapters.length) {
      return res.status(400).json({
        message: "Order length mismatch",
      });
    }

    const reordered = order.map((index, newOrder) => {
      const chapter = book.chapters[index];
      if (!chapter) throw new Error("Invalid chapter index");

      return {
        ...chapter.toObject(),
        order: newOrder,
      };
    });

    book.chapters = reordered;
    await book.save();

    res.json({
      message: "Chapters reordered successfully",
      chapters: book.chapters,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   📦 ORDERS & ANALYTICS
========================= */

/** 📦 Get All Orders */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 📈 Analytics (Revenue per month) */
export const getAnalytics = async (req, res) => {
  try {
    const analytics = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          monthlyRevenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


