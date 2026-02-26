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

/**
 * ✅ UPDATED: upload.any()
 * This allows the route to accept 'cover', 'docFile', 'epubFile', 
 * and dynamic chapter illustrations like 'chapterIllustration_0'.
 */
router.post(
    '/admin/books', 
    verifyAdmin, 
    upload.any(), 
    createBook
);

router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);
router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

/* ==========================================
    STORE & USER ENDPOINTS
   ========================================== */

router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', protect, getReaderView); // Added protect here for user identification
router.post('/rate', protect, rateBook);

export default router;