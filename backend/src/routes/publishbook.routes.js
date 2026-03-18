import express from 'express';
const router = express.Router();

// ✅ Ensure these paths are 100% correct relative to this file
import { 
    getStats, 
    getAdminBooks, 
    createBook, 
    updateChapters, 
    finalizePublish, 
    getReaderView, 
    getStoreBooks, 
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
router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

/* ==========================================
    STORE & USER ENDPOINTS (PUBLIC)
   ========================================== */

router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 

/* ==========================================
    PROTECTED USER ENDPOINTS
   ========================================== */

// Users MUST be logged in to rate a book
router.post('/rate', protect, rateBook);

export default router;