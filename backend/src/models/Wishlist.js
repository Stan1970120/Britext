import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { // Changed from 'user' to 'userId' for consistency
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book", // Updated to match Book model
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);