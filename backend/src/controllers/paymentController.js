// backend/src/controllers/paymentController.js

import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import DownloadToken from "../models/DownloadToken.js";
import { sendEmail } from "../utils/sendEmail.js";

export const verifyPayment = async (req, res) => {
  const { reference, bookIds, expectedAmount, provider = "paystack" } = req.body;
  
  // 1. SAFE USER ID RETRIEVAL FROM REQ
  let userId = req.user?.id || req.user?._id || null;

  if (!reference || !bookIds || (Array.isArray(bookIds) && bookIds.length === 0)) {
    return res.status(400).json({ message: "Reference and Book IDs are required" });
  }

  // Ensure bookIds is formatted as an array
  const formattedBookIds = Array.isArray(bookIds) ? bookIds : [bookIds];

  try {
    let paidAmount = 0;
    let currency = "USD";
    let customerEmail = "";
    let isSuccess = false;

    // 2. HANDSHAKE LOGIC FOR PAYSTACK
    if (provider === "paystack") {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = response.data?.data;
      if (!data) {
        return res.status(400).json({ message: "Invalid transaction payload from Paystack" });
      }

      isSuccess = data.status === "success";
      paidAmount = data.amount / 100; // Amount in local primary currency (NGN)
      currency = data.currency;
      customerEmail = data.customer?.email;
    } 
    
    // 3. HANDSHAKE LOGIC FOR FLUTTERWAVE
    else if (provider === "flutterwave") {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        }
      );

      const data = response.data?.data;
      if (!data) {
        return res.status(400).json({ message: "Invalid transaction payload from Flutterwave" });
      }

      isSuccess = data.status === "successful";
      paidAmount = data.amount; 
      currency = data.currency;
      customerEmail = data.customer?.email;
    }

    // 4. FULFILLMENT PIPELINE
    if (isSuccess) {
      // Fallback: If userId is not in req.user, find user by gateway customer email
      if (!userId && customerEmail) {
        const foundUser = await User.findOne({ email: customerEmail.toLowerCase() });
        if (foundUser) {
          userId = foundUser._id;
        }
      }

      // Update User account in MongoDB
      if (userId) {
        await User.findByIdAndUpdate(
          userId, 
          { $addToSet: { purchasedBooks: { $each: formattedBookIds } } },
          { new: true }
        );
      }

      // GENERATE SECURE 24-HOUR ACCESS TOKEN
      const downloadPayload = { userId, bookIds: formattedBookIds, reference, email: customerEmail };
      const uniqueToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

      await DownloadToken.create({
        token: uniqueToken,
        userId: userId || null,
        bookIds: formattedBookIds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const frontendBase = process.env.FRONTEND_URL || process.env.CLIENT_URL;
      const singleUseDownloadUrl = `${frontendBase}/download?token=${uniqueToken}`;

      // DISPATCH DELIVERY EMAIL INSIDE TRY-CATCH (Non-blocking)
      try {
        if (customerEmail) {
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #035b77;">Thank you for your purchase!</h2>
              <p>Your digital books are ready for download.</p>
              <p>You can access your secure download link below. This link is valid for <strong>24 hours</strong>:</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${singleUseDownloadUrl}" style="background-color: #035b77; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Download Your Books</a>
              </div>
              <hr style="border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">If the button above does not work, copy and paste this URL into your browser:</p>
              <p style="font-size: 12px; color: #035b77; word-break: break-all;">${singleUseDownloadUrl}</p>
            </div>
          `;

          await sendEmail(customerEmail, "Your Secure Book Access - EnjoyReads", emailHtml);
        }
      } catch (emailErr) {
        console.error("Email dispatch failed, but verification completed:", emailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Books successfully added to your library",
        data: { 
          reference, 
          email: customerEmail, 
          amount: paidAmount,
          currency: currency 
        }
      });
    } else {
      return res.status(400).json({ message: "Payment failed or unconfirmed with gateway." });
    }
  } catch (error) {
    console.error(`${provider.toUpperCase()} Verification Error:`, error.response?.data || error.message);
    return res.status(500).json({ 
      message: `Internal Server Error during ${provider} payment verification`,
      error: error.response?.data?.message || error.message
    });
  }
};


/*
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import DownloadToken from "../models/DownloadToken.js";
import { sendEmail } from "../utils/sendEmail.js";

export const verifyPayment = async (req, res) => {
  const { reference, bookIds, expectedAmount, provider = "paystack" } = req.body;
  
  // 1. SAFE USER ID RETRIEVAL
  const userId = req.user?.id || req.user?._id || null;

  if (!reference || !bookIds || (Array.isArray(bookIds) && bookIds.length === 0)) {
    return res.status(400).json({ message: "Reference and Book IDs are required" });
  }

  // Ensure bookIds is formatted as an array
  const formattedBookIds = Array.isArray(bookIds) ? bookIds : [bookIds];

  try {
    let paidAmount = 0;
    let currency = "USD";
    let customerEmail = "";
    let isSuccess = false;

    // 2. HANDSHAKE LOGIC FOR PAYSTACK
    if (provider === "paystack") {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = response.data?.data;
      if (!data) {
        return res.status(400).json({ message: "Invalid transaction payload from Paystack" });
      }

      isSuccess = data.status === "success";
      paidAmount = data.amount / 100; // Amount in local primary currency (NGN)
      currency = data.currency;
      customerEmail = data.customer?.email;
    } 
    
    // 3. HANDSHAKE LOGIC FOR FLUTTERWAVE
    else if (provider === "flutterwave") {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        }
      );

      const data = response.data?.data;
      if (!data) {
        return res.status(400).json({ message: "Invalid transaction payload from Flutterwave" });
      }

      isSuccess = data.status === "successful";
      paidAmount = data.amount; 
      currency = data.currency;
      customerEmail = data.customer?.email;
    }

    // 4. FULFILLMENT PIPELINE
    if (isSuccess) {
      // Update User account if logged in
      if (userId) {
        await User.findByIdAndUpdate(
          userId, 
          { $addToSet: { purchasedBooks: { $each: formattedBookIds } } },
          { new: true }
        );
      }

      // GENERATE SECURE 24-HOUR ACCESS TOKEN
      const downloadPayload = { userId, bookIds: formattedBookIds, reference, email: customerEmail };
      const uniqueToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

      await DownloadToken.create({
        token: uniqueToken,
        userId: userId || null,
        bookIds: formattedBookIds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const frontendBase = process.env.FRONTEND_URL || process.env.CLIENT_URL;
      const singleUseDownloadUrl = `${frontendBase}/download?token=${uniqueToken}`;

      // DISPATCH DELIVERY EMAIL INSIDE TRY-CATCH (Non-blocking)
      try {
        if (customerEmail) {
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #035b77;">Thank you for your purchase!</h2>
              <p>Your digital books are ready for download.</p>
              <p>You can access your secure download link below. This link is valid for <strong>24 hours</strong>:</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${singleUseDownloadUrl}" style="background-color: #035b77; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Download Your Books</a>
              </div>
              <hr style="border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">If the button above does not work, copy and paste this URL into your browser:</p>
              <p style="font-size: 12px; color: #035b77; word-break: break-all;">${singleUseDownloadUrl}</p>
            </div>
          `;

          await sendEmail(customerEmail, "Your Secure Book Access - EnjoyReads", emailHtml);
        }
      } catch (emailErr) {
        console.error("Email dispatch failed, but verification completed:", emailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Books successfully added to your library",
        data: { 
          reference, 
          email: customerEmail, 
          amount: paidAmount,
          currency: currency 
        }
      });
    } else {
      return res.status(400).json({ message: "Payment failed or unconfirmed with gateway." });
    }
  } catch (error) {
    console.error(`${provider.toUpperCase()} Verification Error:`, error.response?.data || error.message);
    return res.status(500).json({ 
      message: `Internal Server Error during ${provider} payment verification`,
      error: error.response?.data?.message || error.message
    });
  }
};
*/