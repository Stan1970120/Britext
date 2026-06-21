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