import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    bookId: { // Changed from 'book' to 'bookId' to match controller
      type: mongoose.Schema.Types.ObjectId,
      ref: "PublishBook", // ✨ Critical: Must match your model name
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
    userId: { // Changed from 'user' to 'userId' to match controller
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