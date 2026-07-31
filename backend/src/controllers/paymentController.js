// backend/src/controllers/paymentController.js

import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import DownloadToken from "../models/DownloadToken.js";
import { sendEmail } from "../utils/sendEmail.js";

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

    // HANDSHAKE LOGIC FOR PAYSTACK
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
      paidAmountUSD = data.amount / 100; 
      currency = data.currency;
      customerEmail = data.customer.email;
    } 
    
    //  HANDSHAKE LOGIC FOR FLUTTERWAVE
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
      paidAmountUSD = data.amount; 
      currency = data.currency;
      customerEmail = data.customer.email;
    }

    // UNIFIED FULFILLMENT MATRIX
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

      // GENERATE SECURE 24-HOUR ACCESS LINK
      const downloadPayload = { userId, bookIds, reference };
      const uniqueToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

      await DownloadToken.create({
        token: uniqueToken,
        userId,
        bookIds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const singleUseDownloadUrl = `${process.env.FRONTEND_URL}/download?token=${uniqueToken}`;

      //  DISPATCH DELIVERY EMAIL VIA RESEND REST API
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #035b77;">Thank you for your purchase!</h2>
          <p>Your digital books have been successfully added to your EnjoyReads library portfolio.</p>
          <p>You can access your secure, single-use download link below. This link is valid for <strong>24 hours</strong>:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${singleUseDownloadUrl}" style="background-color: #035b77; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Download Your Books</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 12px; color: #035b77; word-break: break-all;">${singleUseDownloadUrl}</p>
        </div>
      `;

      await sendEmail(customerEmail, "Your Secure Book Access - EnjoyReads", emailHtml);

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