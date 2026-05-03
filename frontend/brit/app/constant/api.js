import { REST_API } from "./index.js"; 


const BASE_PREFIX = REST_API;


const PUBLISH_PREFIX = `${REST_API}/publish-books`;

export const API = {
  /* DASHBOARD & ADMIN (Uses /api/publish-books) */
  GET_ADMIN_STATS: `${PUBLISH_PREFIX}/admin/stats`,
  ADMIN_BOOKS: (status) => `${PUBLISH_PREFIX}/admin/books?status=${status}`,
  CREATE_BOOK: `${PUBLISH_PREFIX}/admin/books`,
  GET_BOOK: (id) => `${PUBLISH_PREFIX}/admin/books/${id}`,

  /* PUBLISHING & CHAPTERS */
  PUBLISH_BOOK: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/publish`,
  UPDATE_CHAPTERS: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/chapters`,
  ADD_CHAPTER: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/chapters`,
  GET_CHAPTERS: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/chapters`,
  PREVIEW_BOOK: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/preview`,
  UPDATE_CHAPTER: (bookId, chapterId) => 
    `${PUBLISH_PREFIX}/admin/books/${bookId}/chapters/${chapterId}`,

  /* PUBLIC STORE & READER VIEW */
  STORE_BOOKS: `${PUBLISH_PREFIX}/store/books`,
  READER_VIEW: (id) => `${PUBLISH_PREFIX}/store/books/${id}`,

 
  RATE_BOOK: `${BASE_PREFIX}/rate`,        
  CART: `${BASE_PREFIX}/cart`,              
  TOGGLE_WISHLIST: `${BASE_PREFIX}/wishlist`, 
  
  SUBSCRIBE_NEWSLETTER: `${REST_API}/subscribe`,
  COMMENTS: `${REST_API}/comments`,
  TRENDING: `${REST_API}/trending`,
};