import express from 'express';
import { verifyPayment } from '../controllers/paymentController.js';
import { handleUnifiedWebhook } from '../controllers/paymentWebhookController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Client-Side Manual Verification (Requires Auth Token)
router.post('/verify', protect, verifyPayment);

//  Server-to-Server Async Fulfillment 
router.post('/webhook', handleUnifiedWebhook);

export default router;