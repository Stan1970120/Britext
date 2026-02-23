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
    // downloadBook is removed because chapters are stored as text in DB, not a PDF on S3
} from '../controllers/publishbook.controller.js';

// ✅ Fix: Importing from the correct relative paths
import { upload } from '../middleware/publishbook.middleware.js';
import { verifyAdmin } from './authRoutes.js'; // Assuming verifyAdmin is in authRoutes
import { protect } from '../middleware/authMiddleware.js'; 

/* ==========================================
    ADMIN ENDPOINTS
   ========================================== */

router.get('/admin/stats', verifyAdmin, getStats);
router.get('/admin/books', verifyAdmin, getAdminBooks);
router.get('/admin/books/:id', verifyAdmin, getAdminBooks);

// ✅ Updated: Only accepts 'cover' image. Chapters are sent as text in req.body.
router.post(
    '/admin/books', 
    verifyAdmin, 
    upload.fields([
        { name: 'cover', maxCount: 1 }
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

// Note: Removed the download route. 
// Since chapters are text in the DB, "Downloading" would require a PDF generator.

export default router;