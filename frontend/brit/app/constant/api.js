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

  // Fetch a single book for editing
  GET_BOOK: (id) => 
    `${REST_API}/admin/books/${id}`,

  /* ======================================================
     🚀 PUBLISHING & CHAPTERS
     These match your publishbook.routes.js logic
  ====================================================== */
  // Finalize Publication
  PUBLISH_BOOK: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/publish`,

  // Update/Add Chapters (Used for the PATCH requests)
  UPDATE_CHAPTERS: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/chapters`,

  // Specifically for your ChaptersPage component to fix the TS error
  ADD_CHAPTER: (id) => 
    `${REST_API}/publishbook/admin/books/${id}/chapters`,

  /* ======================================================
     📖 PUBLIC STORE & READER VIEW
  ====================================================== */
  STORE_BOOKS: `${REST_API}/publishbook/store/books`,

  READER_VIEW: (id) => 
    `${REST_API}/publishbook/store/books/${id}`,

  /* ======================================================
     🛠️ LEGACY / SPECIFIC ROUTE ACCESS
  ====================================================== */
  // For PREVIEW logic if still using older admin routes
  PREVIEW_BOOK: (id) => 
    `${REST_API}/admin/books/${id}/preview`,

  // Specifically for PUT requests to a single existing chapter
  UPDATE_CHAPTER: (bookId, chapterId) => 
    `${REST_API}/admin/books/${bookId}/chapters/${chapterId}`,
};