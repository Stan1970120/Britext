import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    bookId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book", // Updated to match Book model
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);