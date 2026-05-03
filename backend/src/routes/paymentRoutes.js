const express = require('express');
const router = express.Router();
const { verifyPaystackPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); 


router.post('/verify', protect, verifyPaystackPayment);

module.exports = router;