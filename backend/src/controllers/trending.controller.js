import Book from "../models/publishbook.model.js";

export const getTrendingBooks = async (req, res) => {
  try {
    // Aggregation to get 8 random books
    const books = await Book.aggregate([
      { $match: { status: "published" } }, 
      { $sample: { size: 8 } } 
    ]);

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trending books", error });
  }
};