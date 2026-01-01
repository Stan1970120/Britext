import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    title: { type: String, required: true },

    content: {
      type: Object, // TipTap JSON
      required: true,
    },

    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Chapter", chapterSchema);
