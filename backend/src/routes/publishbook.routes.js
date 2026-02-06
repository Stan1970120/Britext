import express from 'express';
import multer from 'multer';
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

import { verifyAdmin } from '../middleware/publishbook.middleware.js';

// ✅ FIXED: Using 'protect' to match the export name in authMiddleware.js
import { protect } from '../middleware/authMiddleware.js'; 

const upload = multer({ dest: 'uploads/' }); 

/* ==========================================
    ADMIN ENDPOINTS
   ========================================== */

router.get('/admin/stats', verifyAdmin, getStats);
router.get('/admin/books', verifyAdmin, getAdminBooks);

// Route for single book preview/edit
router.get('/admin/books/:id', verifyAdmin, getAdminBooks);

router.post('/admin/books', verifyAdmin, upload.single('cover'), createBook);

// Chapters logic
router.get('/admin/books/:id/chapters', verifyAdmin, getAdminBooks); 
router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);

router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

/* ==========================================
    PUBLIC & USER ENDPOINTS
   ========================================== */

router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 

// ✅ FIXED: Changed 'verifyToken' to 'protect'
router.post('/rate', protect, rateBook);

export default router;