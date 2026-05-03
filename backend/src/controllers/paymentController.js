import axios from "axios";
import User from "../models/User.js";

export const verifyPayment = async (req, res) => {
  const { reference, bookIds } = req.body;
  const userId = req.user.id; 

  try {
    
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, amount, customer } = response.data.data;

    if (status === "success") {
      
      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedBooks: { $each: bookIds } },
      });

      return res.status(200).json({
        success: true,
        message: "Books released to library",
        data: { reference, email: customer.email, amount: amount / 100 }
      });
    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Paystack Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};