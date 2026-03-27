import Comment from "../models/comment.model.js";

export const getComments = async (req, res) => {
  try {
    // Fetch latest 10 approved comments
    const comments = await Comment.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

export const createComment = async (req, res) => {
  try {
    const { name, email, comment } = req.body;
    
    if (!name || !email || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newComment = new Comment({ name, email, comment });
    await newComment.save();

    res.status(201).json({ message: "Comment posted successfully", data: newComment });
  } catch (error) {
    res.status(500).json({ message: "Error saving comment", error });
  }
};