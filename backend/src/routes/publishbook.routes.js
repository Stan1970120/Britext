import express from 'express';
const router = express.Router();

import { 
    getStats, 
    getAdminBooks, 
    createBook, 
    updateChapters, 
    finalizePublish, 
    getReaderView,
    getStoreBooks,
    getStoreBookDetails, // ✨ Added the new public detail controller
    rateBook
} from '../controllers/publishbook.controller.js';

import { upload, verifyAdmin } from '../middleware/publishbook.middleware.js';
import { protect } from '../middleware/authMiddleware.js'; 

/* ==========================================
    ADMIN ENDPOINTS
   ========================================== */

router.get('/admin/stats', verifyAdmin, getStats);
router.get('/admin/books', verifyAdmin, getAdminBooks);
router.get('/admin/books/:id', verifyAdmin, getAdminBooks);

router.post(
    '/admin/books', 
    verifyAdmin, 
    upload.any(), 
    createBook
);

router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);

// MATCHED TO FRONTEND: /api/publish-books/admin/books/:id/publish
router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

/* ==========================================
    STORE & USER ENDPOINTS (PUBLIC)
   ========================================== */

// Accessible to everyone (No 'protect' middleware)
router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getStoreBookDetails); // ✅ Uses the new public controller

/* ==========================================
    PROTECTED USER ENDPOINTS
   ========================================== */

// Users MUST be logged in to rate or read the full content
router.post('/rate', protect, rateBook);
router.get('/reader/:id', protect, getReaderView); // ✅ Secure route for the actual reading experience

export default router;