import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ bookId, quantity: Math.max(1, quantity) }],
      });
      return res.status(201).json(cart);
    }

    const existingItem = cart.items.find(
      (item) => item.bookId && item.bookId.toString() === bookId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ bookId, quantity: Math.max(1, quantity) });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ message: "Failed to add to cart", error: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.bookId",
      model: "PublishBook" 
    });

    if (!cart) {
      return res.json({ items: [], subtotal: 0, totalItems: 0 });
    }

    let subtotal = 0;
    let totalItems = 0;

    // Filter out items where the book was deleted from the store
    const items = cart.items
      .filter(item => item.bookId !== null) 
      .map((item) => {
        const price = item.bookId.price || 0;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;

        return {
          bookId: item.bookId._id, 
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
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter out the specific bookId
    cart.items = cart.items.filter(
      (item) => item.bookId && item.bookId.toString() !== bookId
    );

    await cart.save();
    res.json({ message: "Item removed", items: cart.items });
  } catch (err) {
    console.error("Remove from Cart Error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

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