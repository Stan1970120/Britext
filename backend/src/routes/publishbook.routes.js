backend/src/routes/publishbook.routes.js


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

// ✅ consolidated imports from the middleware folder
import { upload, verifyAdmin } from '../middleware/publishbook.middleware.js';
import { protect } from '../middleware/authMiddleware.js'; 

/* ==========================================
    ADMIN ENDPOINTS
   ========================================== */

router.get('/admin/stats', verifyAdmin, getStats);
router.get('/admin/books', verifyAdmin, getAdminBooks);
router.get('/admin/books/:id', verifyAdmin, getAdminBooks);

// Accepts 'cover' image. Chapters are sent as text in req.body.
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

export default router;