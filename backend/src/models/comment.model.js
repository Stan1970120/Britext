import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  comment: { type: String, required: true },
  role: { type: String, default: "Verified User" },
  img: { type: String, default: "" }, 
  status: { type: String, enum: ["pending", "approved"], default: "approved" },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;