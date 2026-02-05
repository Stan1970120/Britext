import jwt from "jsonwebtoken"; // Add this import at the top

export const getBooks = async (req, res) => {
  try {
    const { category } = req.query;
    
    // 1. Check for token manually since this is a public route
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token invalid? Just treat as guest, don't crash.
        userId = null;
      }
    }

    // 2. Filter published books
    // NOTE: If your DB is empty or books are "draft", this returns []
    const filter = { status: "published" };
    if (category && category !== "All Books") {
      filter.category = category;
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });

    // 3. Get Cart/Wishlist info if we have a userId
    let cartBookIds = [];
    let wishlistBookIds = [];

    if (userId) {
      const [cart, wishlist] = await Promise.all([
        Cart.findOne({ userId }),
        Wishlist.findOne({ userId })
      ]);
      cartBookIds = cart?.items.map((item) => item.bookId.toString()) || [];
      wishlistBookIds = wishlist?.books.map((id) => id.toString()) || [];
    }

    const enrichedBooks = books.map((book) => ({
      ...book.toObject(),
      image: book.coverImage, 
      isInCart: cartBookIds.includes(book._id.toString()),
      isWishlisted: wishlistBookIds.includes(book._id.toString()),
    }));

    res.json(enrichedBooks);
  } catch (err) {
    console.error("Storefront Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};