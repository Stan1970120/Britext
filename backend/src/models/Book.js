import mongoose from "mongoose";

/*  CHAPTER SCHEMA*/
const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    
    content: {
      type: Object,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    isFreePreview: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/* =========================
   📚 BOOK SCHEMA
========================= */
const bookSchema = new mongoose.Schema(
  {
    /* ================= CORE INFO ================= */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    /* ================= PRICING ================= */
    price: {
      type: Number,
      default: 0,
    },

    originalPrice: {
      type: Number,
    },

    /* ================= RATING ================= */
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    /* ================= MEDIA ================= */
    image: {
      type: String, // cover image URL
      required: true,
    },

    /* ================= DESCRIPTION ================= */
    summary: {
      type: String,
    },

    /* ================= BOOK CONTENT ================= */
    chapters: {
      type: [chapterSchema],
      default: [],
    },

    /* ================= PUBLISH FLOW ================= */
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
    },

    /* ================= ADMIN / AUTHOR ================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= METADATA ================= */
    edition: String,
    pages: Number,
    language: String,
    publisher: String,
    publishDate: String,
    dimensions: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Book", bookSchema);
