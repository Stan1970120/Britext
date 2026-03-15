import { REST_API } from "./index"; 

// Assuming your backend mounts the router at: app.use('/api/publish-books', router)
const PREFIX = `${REST_API}/publish-books`;

export const API = {
  /* ADMIN */
  GET_ADMIN_STATS: `${PREFIX}/admin/stats`,
  ADMIN_BOOKS: (status) => `${PREFIX}/admin/books?status=${status}`,
  CREATE_BOOK: `${PREFIX}/admin/books`,
  GET_BOOK: (id) => `${PREFIX}/admin/books/${id}`,
  PUBLISH_BOOK: (id) => `${PREFIX}/admin/books/${id}/publish`,
  UPDATE_CHAPTERS: (id) => `${PREFIX}/admin/books/${id}/chapters`,
  
  /* STORE & PUBLIC */
  STORE_BOOKS: `${PREFIX}/store/books`,
  READER_VIEW: (id) => `${PREFIX}/store/books/${id}`,
  
  /* PROTECTED USER ACTIONS */
  RATE_BOOK: `${PREFIX}/rate`, // Matches router.post('/rate', protect, rateBook);
};