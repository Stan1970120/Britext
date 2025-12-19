// controllers/adminController.js
import Book from "../models/Book.js";
import Order from "../models/order.js";
import User from "../models/User.js";

/**
 * Combined dashboard with stats + recent activity
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);
    const revenue = revenueAgg[0]?.totalRevenue || 0;

    const recentActivityBooks = await Book.find()
      .sort({ uploadedAt: -1 })
      .limit(5);

    const recentActivityOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivityUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivity = [
      ...recentActivityBooks.map((b) => ({
        type: "book",
        message: `New book uploaded: ${b.title}`,
        timestamp: b.uploadedAt,
      })),
      ...recentActivityOrders.map((o) => ({
        type: "order",
        message: `Order placed: ₦${o.total}`,
        timestamp: o.createdAt,
      })),
      ...recentActivityUsers.map((u) => ({
        type: "user",
        message: `New user signed up: ${u.name}`,
        timestamp: u.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      stats: {
        totalBooks,
        totalOrders,
        activeUsers,
        revenue,
      },
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Modular endpoints
 */
export const getTotalBooks = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    res.json({ totalBooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ isActive: true });
    res.json({ activeUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

export const getRecentActivity = async (req, res) => {
  try {
    const recentActivityBooks = await Book.find()
      .sort({ uploadedAt: -1 })
      .limit(5);

    const recentActivityOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivityUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivity = [
      ...recentActivityBooks.map((b) => ({
        type: "book",
        message: `New book uploaded: ${b.title}`,
        timestamp: b.uploadedAt,
      })),
      ...recentActivityOrders.map((o) => ({
        type: "order",
        message: `Order placed: ₦${o.total}`,
        timestamp: o.createdAt,
      })),
      ...recentActivityUsers.map((u) => ({
        type: "user",
        message: `New user signed up: ${u.name}`,
        timestamp: u.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ recentActivity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSidebarLinks = async (req, res) => {
  try {
    // Example static links — you can customize
    const links = [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Books", path: "/admin/books" },
      { name: "Orders", path: "/admin/orders" },
      { name: "Users", path: "/admin/users" },
      { name: "Reports", path: "/admin/reports" },
    ];
    res.json({ links });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};