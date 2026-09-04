import User from "../models/User.js";


export const getUserBooks = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("purchasedBooks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      purchasedBooks: user.purchasedBooks || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};