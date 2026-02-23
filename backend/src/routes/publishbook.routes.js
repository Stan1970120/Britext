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
    rateBook,
    downloadBook // ✨ NEW: Import the download controller
} from '../controllers/publishbook.controller.js';

import { verifyAdmin, upload } from '../middleware/publishbook.middleware.js';
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
    upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'manuscript', maxCount: 1 }
    ]), 
    createBook
);

router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);
router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

/* ==========================================
    STORE & USER ENDPOINTS
   ========================================== */

router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 
router.post('/rate', protect, rateBook);

/**
 * ✅ NEW: SECURE DOWNLOAD ROUTE
 * This generates a 15-minute temporary link for the PDF/EPUB.
 * We use 'protect' so only logged-in users can access it.
 */
router.get('/store/books/:id/download', protect, downloadBook);

export default router;