import express from 'express';
const router = express.Router();

// Import your controller functions
import { 
    getStats, 
    getAdminBooks, 
    createBook, 
    updateChapters, 
    finalizePublish, 
    getReaderView,
    getStoreBooks 
} from '../controllers/publishbook.controller.js';

// Import your middleware
import { verifyAdmin } from '../middleware/publishbook.middleware.js';

/* ==========================================
    ADMIN ENDPOINTS (Requires verifyAdmin)
   ========================================== */

// 1. Dashboard Stats (The 4 cards)
router.get('/admin/stats', verifyAdmin, getStats);

// 2. Fetch Books by Status (For the Draft/Published tabs)
router.get('/admin/books', verifyAdmin, getAdminBooks);

// 3. Create a New Manuscript
router.post('/admin/books', verifyAdmin, createBook);

/**
 * 📖 CHAPTER EDITOR ROUTES
 * We use the same controller 'updateChapters' for both loading and saving.
 */

// ✨ NEW: Fetch chapters to load them into the editor (Fixes the 404)
router.get('/admin/books/:id/chapters', verifyAdmin, updateChapters);

// Update or Add Chapters (The Save button)
router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);

// 5. Finalize Publication (The Publishing Portal)
router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);


/* ==========================================
    PUBLIC ENDPOINTS (Available to readers)
   ========================================== */

// 6. Get Bookstore List (Only published books)
router.get('/store/books', getStoreBooks);

// 7. Protected Reader View (Checks for payment/locked content)
router.get('/store/books/:id', getReaderView); 

export default router;