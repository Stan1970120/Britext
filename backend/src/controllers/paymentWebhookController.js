import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DownloadToken from '../models/DownloadToken.js';
import { sendEmail } from '../utils/sendEmail.js'; 

export const handleUnifiedWebhook = async (req, res) => {
  try {
    const paystackSignature = req.headers['x-paystack-signature'];
    const flwSignature = req.headers['verif-hash'];

    let orderData = null;

    // FLUTTERWAVE SIGNATURE PARSING
    if (flwSignature) {
      if (flwSignature !== process.env.FLW_WEBHOOK_SECRET_HASH) {
        return res.status(401).json({ message: "Untrusted Flutterwave signature dropped." });
      }

      const { event, data } = req.body;
      if (event === "charge.completed" && data.status === "successful") {
        const bookIds = typeof data.meta?.bookIds === 'string' ? JSON.parse(data.meta.bookIds) : (data.meta?.bookIds || []);
        const userId = data.meta?.userId || null;
        // Fallback email check from metadata or customer payload
        const customerEmail = data.customer?.email || data.meta?.email;

        orderData = {
          userId,
          bookIds,
          reference: data.tx_ref,
          email: customerEmail
        };
      }
    } 
    
    // PAYSTACK SIGNATURE PARSING
    else if (paystackSignature) {
      // Use rawBody buffer if configured in middleware, otherwise fallback to req.body
      const bodyData = req.rawBody ? req.rawBody : JSON.stringify(req.body);
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(bodyData)
        .digest('hex');

      if (hash !== paystackSignature) {
        return res.status(401).json({ message: "Untrusted Paystack signature dropped." });
      }

      const event = req.body;
      if (event.event === 'charge.success') {
        const { customer, metadata, reference } = event.data;
        const rawBookIds = metadata?.bookIds;
        const bookIds = typeof rawBookIds === 'string' ? JSON.parse(rawBookIds) : (rawBookIds || []);
        // Fallback email check from customer payload or metadata
        const customerEmail = customer?.email || metadata?.email;

        orderData = {
          userId: metadata?.userId || null,
          bookIds,
          reference,
          email: customerEmail
        };
      }
    }

    // UNIFIED DOWNLOAD LINK GENERATION & EMAIL DISPATCH
    if (orderData && orderData.email && orderData.bookIds.length > 0) {
      const { userId, bookIds, reference, email } = orderData;

      // Update User portfolio state if logged in
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { purchasedBooks: { $each: bookIds } }
        });
      }

      // Generate secure 24h jwt download authorization string
      const downloadPayload = { userId, bookIds, reference, email };
      const uniqueToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Document authorization model footprint inside database
      await DownloadToken.create({
        token: uniqueToken,
        userId: userId || null,
        bookIds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      // Map to FRONTEND_URL or CLIENT_URL fallback
      const frontendBase = process.env.FRONTEND_URL || process.env.CLIENT_URL;
      const singleUseDownloadUrl = `${frontendBase}/download?token=${uniqueToken}`;
      
      // Send secure access link email
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

      // Isolated error boundary so email failure doesn't crash database records
      try {
        await sendEmail(email, "Your Secure Book Access - EnjoyReads", emailHtml);
      } catch (emailErr) {
        console.error(`[CRITICAL] Order token created for ${email}, but email dispatch failed:`, emailErr.message);
      }
    }

    return res.status(200).send('Event captured safely.');
  } catch (err) {
    console.error("System Webhook Failure Layer: ", err);
    return res.status(500).json({ error: "Fulfillment processing pipeline exception dropped." });
  }
};
/*
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DownloadToken from '../models/DownloadToken.js';
import { sendEmail } from '../utils/sendEmail.js'; 

export const handleUnifiedWebhook = async (req, res) => {
  try {
    const paystackSignature = req.headers['x-paystack-signature'];
    const flwSignature = req.headers['verif-hash'];

    let orderData = null;

    // FLUTTERWAVE SIGNATURE PARSING
    if (flwSignature) {
      if (flwSignature !== process.env.FLW_WEBHOOK_SECRET_HASH) {
        return res.status(401).json({ message: "Untrusted Flutterwave signature dropped." });
      }

      const { event, data } = req.body;
      if (event === "charge.completed" && data.status === "successful") {
        const bookIds = typeof data.meta?.bookIds === 'string' ? JSON.parse(data.meta.bookIds) : (data.meta?.bookIds || []);
        const userId = data.meta?.userId || null;

        orderData = {
          userId,
          bookIds,
          reference: data.tx_ref,
          email: data.customer?.email
        };
      }
    } 
    
    // PAYSTACK SIGNATURE PARSING
    else if (paystackSignature) {
      // Use rawBody buffer if configured in middleware, otherwise fallback to req.body
      const bodyData = req.rawBody ? req.rawBody : JSON.stringify(req.body);
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(bodyData)
        .digest('hex');

      if (hash !== paystackSignature) {
        return res.status(401).json({ message: "Untrusted Paystack signature dropped." });
      }

      const event = req.body;
      if (event.event === 'charge.success') {
        const { customer, metadata, reference } = event.data;
        const rawBookIds = metadata?.bookIds;
        const bookIds = typeof rawBookIds === 'string' ? JSON.parse(rawBookIds) : (rawBookIds || []);

        orderData = {
          userId: metadata?.userId || null,
          bookIds,
          reference,
          email: customer?.email
        };
      }
    }

    // UNIFIED DOWNLOAD LINK GENERATION & EMAIL DISPATCH
    if (orderData && orderData.email && orderData.bookIds.length > 0) {
      const { userId, bookIds, reference, email } = orderData;

      // Update User portfolio state if logged in
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { purchasedBooks: { $each: bookIds } }
        });
      }

      // Generate secure 24h jwt download authorization string
      const downloadPayload = { userId, bookIds, reference, email };
      const uniqueToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Document authorization model footprint inside database
      await DownloadToken.create({
        token: uniqueToken,
        userId: userId || null,
        bookIds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      // Map to FRONTEND_URL or CLIENT_URL fallback
      const frontendBase = process.env.FRONTEND_URL || process.env.CLIENT_URL;
      const singleUseDownloadUrl = `${frontendBase}/download?token=${uniqueToken}`;
      
      // Send secure access link email
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

      await sendEmail(email, "Your Secure Book Access - EnjoyReads", emailHtml);
    }

    return res.status(200).send('Event captured safely.');
  } catch (err) {
    console.error("System Webhook Failure Layer: ", err);
    return res.status(500).json({ error: "Fulfillment processing pipeline exception dropped." });
  }
};

*/