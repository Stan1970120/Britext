
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
    deleteBook 
} from '../controllers/publishbook.controller.js';

import { upload, verifyAdmin } from '../middleware/publishbook.middleware.js';
import { protect } from '../middleware/authMiddleware.js'; 

// ADMIN ROUTES

router.get('/admin/stats', verifyAdmin, getStats);
router.get('/admin/books', verifyAdmin, getAdminBooks);
router.get('/admin/books/:id', verifyAdmin, getAdminBooks);

// upload.any() handles 'cover', 'secondaryImage', and manuscript files
router.post(
    '/admin/books', 
    verifyAdmin, 
    upload.any(), 
    createBook
);

router.patch('/admin/books/:id/chapters', verifyAdmin, updateChapters);

// Handles technical metadata: pages, language, publisher, year, dimensions
router.patch('/admin/books/:id/publish', verifyAdmin, finalizePublish);

router.delete('/:id', verifyAdmin, deleteBook);

// PUBLIC/STORE ROUTES

router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 

// USER ROUTES 

router.post('/rate', protect, rateBook);

export default router;

/*
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
    deleteBook 
} from '../controllers/publishbook.controller.js';

import { upload, verifyAdmin } from '../middleware/publishbook.middleware.js';
import { protect } from '../middleware/authMiddleware.js'; 



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


router.delete('/:id', verifyAdmin, deleteBook);



router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 


router.post('/rate', protect, rateBook);

export default router;

/*
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


router.get('/store/books', getStoreBooks);
router.get('/store/books/:id', getReaderView); 


router.post('/rate', protect, rateBook);

export default router;
*/