import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

/**
 * POST /api/cart
 * Add book to cart (auth required)
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ userId });

    // Create cart if none exists
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ bookId, quantity }],
      });

      return res.status(201).json(cart);
    }

    // Prevent duplicates (server-side)
    const existingItem = cart.items.find(
      (item) => item.bookId.toString() === bookId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ bookId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

/**
 * GET /api/cart
 * Used by Cart page (real totals)
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate(
      "items.bookId"
    );

    if (!cart) {
      return res.json({
        items: [],
        subtotal: 0,
        totalItems: 0,
      });
    }

    let subtotal = 0;
    let totalItems = 0;

    const items = cart.items.map((item) => {
      const price = item.bookId.price;
      const itemTotal = price * item.quantity;

      subtotal += itemTotal;
      totalItems += item.quantity;

      return {
        book: item.bookId,
        quantity: item.quantity,
        itemTotal,
      };
    });

    res.json({
      items,
      subtotal,
      totalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

/**
 * DELETE /api/cart/:bookId
 * Remove item from cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.json(cart);

    cart.items = cart.items.filter(
      (item) => item.bookId.toString() !== bookId
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

/**
 * POST-LOGIN MERGE
 * Merge guest cart into user cart
 */
export const mergeGuestCart = async (userId, guestItems = []) => {
  if (!guestItems.length) return;

  let cart = await Cart.findOne({ userId });

  // Create cart if none exists
  if (!cart) {
    await Cart.create({
      userId,
      items: guestItems.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity || 1,
      })),
    });
    return;
  }

  guestItems.forEach((guestItem) => {
    const existing = cart.items.find(
      (item) =>
        item.bookId.toString() === guestItem.bookId
    );

    if (existing) {
      existing.quantity += guestItem.quantity || 1;
    } else {
      cart.items.push({
        bookId: guestItem.bookId,
        quantity: guestItem.quantity || 1,
      });
    }
  });

  await cart.save();
};
