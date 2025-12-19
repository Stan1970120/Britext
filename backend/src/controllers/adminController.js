import Book from "../models/Book.js";

import User from "../models/User.js";

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
    const revenue = revenueAgg[0]?.totalRevenue || 0;
    res.json({ revenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 🕒 Recent Activities */
export const getRecentActivities = async (req, res) => {
  try {
    const recentBooks = await Book.find().sort({ uploadedAt: -1 }).limit(5);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    const activities = [
      ...recentBooks.map((b) => ({
        type: "book",
        message: `New book uploaded: ${b.title}`,
        timestamp: b.uploadedAt,
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

/** 📚 Get All Books */
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json({ books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 📤 Upload Book */
export const uploadBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 📦 Get All Orders */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** 📈 Analytics (example: revenue per month) */
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