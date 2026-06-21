// backend/src/controllers/paymentController.js

import axios from "axios";
import User from "../models/User.js";

export const verifyPayment = async (req, res) => {
  const { reference, bookIds, expectedAmount, provider = "paystack" } = req.body; 
  const userId = req.user.id; 

  if (!reference || !bookIds || bookIds.length === 0) {
    return res.status(400).json({ message: "Reference and Book IDs are required" });
  }

  try {
    let paidAmountUSD = 0;
    let currency = "USD";
    let customerEmail = "";
    let isSuccess = false;

    // === HANDSHAKE LOGIC FOR PAYSTACK ===
    if (provider === "paystack") {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = response.data.data;
      isSuccess = data.status === "success";
      paidAmountUSD = data.amount / 100; // Paystack returns amount in cents
      currency = data.currency;
      customerEmail = data.customer.email;
    } 
    
    // === HANDSHAKE LOGIC FOR FLUTTERWAVE ===
    else if (provider === "flutterwave") {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        }
      );

      const data = response.data.data;
      isSuccess = data.status === "successful";
      paidAmountUSD = data.amount; // Flutterwave returns standard decimal amount
      currency = data.currency;
      customerEmail = data.customer.email;
    }

    // === UNIFIED FULFILLMENT MATRIX ===
    if (isSuccess) {
      if (expectedAmount && paidAmountUSD < expectedAmount) {
         return res.status(400).json({ message: "Payment amount mismatch detected." });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { $addToSet: { purchasedBooks: { $each: bookIds } } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Books successfully added to your library",
        data: { 
          reference, 
          email: customerEmail, 
          amount: paidAmountUSD,
          currency: currency 
        }
      });
    } else {
      return res.status(400).json({ message: `Payment failed or unconfirmed with gateway.` });
    }
  } catch (error) {
    console.error(`${provider.toUpperCase()} Verification Error:`, error.response?.data || error.message);
    res.status(500).json({ 
      message: `Internal Server Error during ${provider} payment verification`,
      error: error.response?.data?.message || "Transaction matching instance dropped."
    });
  }
};

/*
import axios from "axios";
import User from "../models/User.js";


export const verifyPayment = async (req, res) => {
  const { reference, bookIds, expectedAmount } = req.body; 
  const userId = req.user.id; 

  if (!reference || !bookIds || bookIds.length === 0) {
    return res.status(400).json({ message: "Reference and Book IDs are required" });
  }

  try {
    
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, amount, currency, customer } = response.data.data;

    
    const paidAmountUSD = amount / 100;

    if (status === "success") {
      
      if (expectedAmount && paidAmountUSD < expectedAmount) {
         return res.status(400).json({ message: "Payment amount mismatch detected." });
      }

    
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { $addToSet: { purchasedBooks: { $each: bookIds } } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Books successfully added to your library",
        data: { 
          reference, 
          email: customer.email, 
          amount: paidAmountUSD,
          currency: currency 
        }
      });
    } else {
      return res.status(400).json({ message: `Payment failed with status: ${status}` });
    }
  } catch (error) {
    // Detailed logging for debugging
    console.error("Paystack Verification Error:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Internal Server Error during payment verification",
      error: error.response?.data?.message || "Transaction not found"
    });
  }
};
*/