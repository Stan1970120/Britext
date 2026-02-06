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
    rateBook // ✨ ADDED: Rating controller logic
} from '../controllers/publishbook.controller.js';

import { verifyAdmin } from '../middleware/publishbook.middleware.js';
// Note: You need a standard user verification middleware for ratings
// If you don't have verifyToken, ensure your auth middleware is imported here
import { verifyToken } from '../middleware/auth.middleware.js'; 

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

// ✨ ADDED: Rating Endpoint
// We use verifyToken because we need to know WHICH user is rating the book
router.post('/rate', verifyToken, rateBook);

export default router;