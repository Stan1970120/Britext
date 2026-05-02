const Book = require("../models/Book"); 

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the book exists and delete it
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    //  Return success
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { deleteBook };