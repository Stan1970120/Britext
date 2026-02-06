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
    getStoreBooks 
} from '../controllers/publishbook.controller.js';

import { verifyAdmin } from '../middleware/publishbook.middleware.js';

const upload = multer({ dest: 'uploads/' }); 

/* ==========================================
    ADMIN ENDPOINTS
   ========================================== */

router.get('/admin/stats', verifyAdmin, getStats);
router.get('/admin/books', verifyAdmin, getAdminBooks);

// ✨ ADDED: Route for single book preview/edit to fix the 404
router.get('/admin/books/:id', verifyAdmin, getAdminBooks);

router.post('/admin/books', verifyAdmin, upload.single('cover'), createBook);

// Chapters logic
router.get('/admin/books/:id/chapters', verifyAdmin, getAdminBooks); // Use getAdminBooks to fetch current chapters
router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);

router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

/* ==========================================
    PUBLIC ENDPOINTS
   ========================================== */

router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 

export default router;