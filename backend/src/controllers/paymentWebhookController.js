import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DownloadToken from '../models/DownloadToken.js';
// import { sendDownloadEmail } from 

export const handleUnifiedWebhook = async (req, res) => {
  try {
    const paystackSignature = req.headers['x-paystack-signature'];
    const flwSignature = req.headers['verif-hash'];

    let orderData = null;

    //  FLUTTERWAVE SIGNATURE PARSING
    
    if (flwSignature) {
      if (flwSignature !== process.env.FLW_WEBHOOK_SECRET_HASH) {
        return res.status(401).json({ message: "Untrusted Flutterwave signature signature dropped." });
      }

      const { event, data } = req.body;
      if (event === "charge.completed" && data.status === "successful") {
        // Recover metadata strings cleanly passed from checkout payload
        const bookIds = JSON.parse(data.meta?.bookIds || "[]");
        const userId = data.meta?.userId || null;

        orderData = {
          userId,
          bookIds,
          reference: data.tx_ref,
          email: data.customer?.email
        };
      }
    } 
    
    
    else if (paystackSignature) {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== paystackSignature) {
        return res.status(401).json({ message: "Untrusted Paystack signature signature dropped." });
      }

      const event = req.body;
      if (event.event === 'charge.success') {
        const { customer, metadata, reference } = event.data;
        orderData = {
          userId: metadata?.userId || null,
          bookIds: metadata?.bookIds || [],
          reference,
          email: customer?.email
        };
      }
    }

    
    if (orderData && orderData.userId && orderData.bookIds.length > 0) {
      const { userId, bookIds, reference, email } = orderData;

      // Update User portfolio state
      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedBooks: { $each: bookIds } }
      });

      // Generate secure 24h jwt download authorization string
      const downloadPayload = { userId, bookIds, reference };
      const uniqueToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Document authorization model footprint inside database
      await DownloadToken.create({
        token: uniqueToken,
        userId,
        bookIds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const singleUseDownloadUrl = `${process.env.FRONTEND_URL}/download?token=${uniqueToken}`;
      console.log(`Fulfillment complete. Secure web delivery mapping generated for ${email}: ${singleUseDownloadUrl}`);
      
      //sendDownloadEmail(email, singleUseDownloadUrl);
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
// import { sendDownloadEmail } from '../utils/emailService.js'; 

export const handlePaystackWebhook = async (req, res) => {
  try {
    //  Validate Paystack Signature Layer
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: "Untrusted signature hash source dropped." });
    }

    const event = req.body;

    //  Process only successful charges
    if (event.event === 'charge.success') {
      const { customer, metadata, reference } = event.data;
      
      // Metadata payload array passed from your Paystack frontend config setup
      const { bookIds, userId } = metadata; 

      // Update User purchased portfolio state
      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedBooks: { $each: bookIds } }
      });

      //  Generate a secure crypto token wrapper expiring in 24 hours
      const downloadPayload = { userId, bookIds, reference };
      const uniqueToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Save token validation footprint inside the database
      await DownloadToken.create({
        token: uniqueToken,
        userId,
        bookIds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 Hours
      });

      //  Construct Single Use Access Destination URL target 
      const singleUseDownloadUrl = `${process.env.FRONTEND_URL}/download?token=${uniqueToken}`;

      
      console.log(`Fulfillment complete. Secure access gateway mapping routed: ${singleUseDownloadUrl}`);
    }

    return res.status(200).send('Event captured safely.');
  } catch (err) {
    console.error("System Webhook Failure Layer: ", err);
    return res.status(500).json({ error: "Fulfillment processing pipeline exception dropped." });
  }
};
*/



