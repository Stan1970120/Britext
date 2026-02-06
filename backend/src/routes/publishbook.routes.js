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

// ✅ CORRECTED: Matching your path /src/middleware/authMiddleware.js
import { verifyAdmin } from '../middleware/publishbook.middleware.js';
import { verifyToken } from '../middleware/authMiddleware.js'; 

const upload = multer({ dest: 'uploads/' }); 

/* ==========================================
    ADMIN ENDPOINTS
   ========================================== */

router.get('/admin/stats', verifyAdmin, getStats);
router.get('/admin/books', verifyAdmin, getAdminBooks);
router.get('/admin/books/:id', verifyAdmin, getAdminBooks);

router.post('/admin/books', verifyAdmin, upload.single('cover'), createBook);

router.get('/admin/books/:id/chapters', verifyAdmin, getAdminBooks); 
router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);

router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

/* ==========================================
    PUBLIC & USER ENDPOINTS
   ========================================== */

router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 

// Uses verifyToken from your authMiddleware.js
router.post('/rate', verifyToken, rateBook);

export default router;