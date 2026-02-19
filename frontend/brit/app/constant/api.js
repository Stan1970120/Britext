import { REST_API } from "./index"; 

export const API = {
  /* ======================================================
      📊 DASHBOARD & ANALYTICS
      Mounted on: /api/publishbook/admin/stats
  ====================================================== */
  GET_ADMIN_STATS: `${REST_API}/publishbook/admin/stats`,

  /* ======================================================
      📚 BOOK MANAGEMENT (Admin)
      Mounted on: /api/publishbook/admin/books
  ====================================================== */
  // Fetch Books by Status (Draft/Published)
  ADMIN_BOOKS: (status) => 
    `${REST_API}/publishbook/admin/books?status=${status}`,

  // Create a New Manuscript
  CREATE_BOOK: `${REST_API}/publishbook/admin/books`,

  // ✨ FIXED: Added /publishbook prefix to match controller logic
  GET_BOOK: (id) => 
    `${REST_API}/publishbook/admin/books/${id}`,

  /* ======================================================
      🚀 PUBLISHING & CHAPTERS
      These match your publishbook.routes.js logic
  ====================================================== */
  // Finalize Publication (Moves book to Storefront)
  PUBLISH_BOOK: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/publish`,

  // Update/Add Chapters (Used for PATCH requests)
  UPDATE_CHAPTERS: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/chapters`,

  // Specifically for saving new chapters in ChaptersPage
  ADD_CHAPTER: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/chapters`,

  // Fixes build error "Property 'GET_CHAPTERS' does not exist"
  GET_CHAPTERS: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/chapters`,

  /* ======================================================
      📖 PUBLIC STORE & READER VIEW
  ====================================================== */
  STORE_BOOKS: `${REST_API}/publishbook/store/books`,

  READER_VIEW: (id) => 
    `${REST_API}/publishbook/store/books/${id}`,

  /* ======================================================
      🛠️ LEGACY / SPECIFIC ROUTE ACCESS
      Ensuring these also use the consolidated /publishbook prefix
  ====================================================== */
  // For PREVIEW logic
  PREVIEW_BOOK: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/preview`,

  // Specifically for PUT requests to a single existing chapter
  UPDATE_CHAPTER: (bookId, chapterId) => 
    `${REST_API}/publishbook/admin/books/${bookId}/chapters/${chapterId}`,
};