import Cart from "../models/Cart.js";
import PublishBook from "../models/publishbook.model.js";

export const addToCart = async (req, res) => {
  try {
    // 1. Fix: Ensure userId is extracted safely from either req.user.id or req.user._id
    const userId = req.user?.id || req.user?._id;
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ bookId, quantity }],
      });
      return res.status(201).json(cart);
    }

    // 2. Fix: Check if bookId exists to prevent .toString() errors if database is inconsistent
    const existingItem = cart.items.find(
      (item) => item.bookId && item.bookId.toString() === bookId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ bookId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Add to Cart Error:", err); // ✨ Logging the real error helps you see it in Render logs
    res.status(500).json({ message: "Failed to add to cart", error: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    // ✨ populate with the specific model to avoid "ref" confusion
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.bookId",
      model: "PublishBook" 
    });

    if (!cart) {
      return res.json({ items: [], subtotal: 0, totalItems: 0 });
    }

    let subtotal = 0;
    let totalItems = 0;

    // 3. Fix: Filter out any items where bookId might be null (if a book was deleted)
    const items = cart.items
      .filter(item => item.bookId !== null) 
      .map((item) => {
        const price = item.bookId.price || 0;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;

        return {
          book: item.bookId,
          quantity: item.quantity,
          itemTotal,
        };
      });

    res.json({ items, subtotal, totalItems });
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { bookId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter(
      (item) => item.bookId && item.bookId.toString() !== bookId
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

// Exporting mergeGuestCart for use in login controller
export const mergeGuestCart = async (userId, guestItems = []) => {
  if (!guestItems || !guestItems.length) return;
  
  let cart = await Cart.findOne({ userId });
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
      (item) => item.bookId && item.bookId.toString() === guestItem.bookId
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