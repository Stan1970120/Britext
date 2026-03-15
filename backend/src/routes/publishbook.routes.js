// ✅ Added .js extension to the import to satisfy ESM requirements on Render
import { REST_API } from "./index.js"; 

// The prefix should match the mount point in your backend server.js/index.js
// e.g., app.use('/api/publish-books', publishbookRoutes);
const PREFIX = `${REST_API}/publish-books`;

export const API = {
  /* ==========================================
      📊 DASHBOARD & ADMIN
     ========================================== */
  GET_ADMIN_STATS: `${PREFIX}/admin/stats`,
  
  // Fetch Books by Status (Draft/Published)
  ADMIN_BOOKS: (status) => `${PREFIX}/admin/books?status=${status}`,
  
  CREATE_BOOK: `${PREFIX}/admin/books`,
  
  GET_BOOK: (id) => `${PREFIX}/admin/books/${id}`,

  /* ==========================================
      🚀 PUBLISHING & CHAPTERS
     ========================================== */
  PUBLISH_BOOK: (id) => `${PREFIX}/admin/books/${id}/publish`,
  
  UPDATE_CHAPTERS: (id) => `${PREFIX}/admin/books/${id}/chapters`,

  /* ==========================================
      📖 STORE & PUBLIC READER
     ========================================== */
  // Get all published books for the store
  STORE_BOOKS: `${PREFIX}/store/books`,
  
  // Get specific book details for the reader/store view
  READER_VIEW: (id) => `${PREFIX}/store/books/${id}`,

  /* ==========================================
      ⭐ USER INTERACTIONS (PROTECTED)
     ========================================== */
  // Matches: router.post('/rate', protect, rateBook);
  RATE_BOOK: `${PREFIX}/rate`, 
};