import { REST_API } from "./index.js"; 


const BASE_PREFIX = REST_API;


const PUBLISH_PREFIX = `${REST_API}/publish-books`;
const BLOG_PREFIX = `${REST_API}/blogs`;

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
  INITIALIZE_PAYMENT: `${REST_API}/payments/initialize`,
  VERIFY_PAYMENT: `${REST_API}/payments/verify`,
  MY_BOOKS: `${REST_API}/me/books`,

  /* BLOGS ENGINE */
  BLOG_UPLOAD_S3: `${BLOG_PREFIX}/admin/upload-s3`,
  BLOG_CREATE: `${BLOG_PREFIX}/admin/create`,
  BLOG_GET_ALL_ADMIN: `${BLOG_PREFIX}/admin/all`,
  BLOG_DELETE_ADMIN: (id) => `${BLOG_PREFIX}/admin/${id}`,
  BLOG_METRICS: `${BLOG_PREFIX}/admin/metrics`,
  BLOG_PUBLIC_FEED: `${BLOG_PREFIX}/public/feed`,
  FLUTTERWAVE_INITIALIZE: `${REST_API}/payments/create-flutterwave-session`,
  PAYMENT_VERIFY: `${REST_API}/payments/verify`,
  PAYMENT_WEBHOOK: `${REST_API}/payments/webhook`, 
  DOWNLOAD_SECURE_CLAIM: `${REST_API}/downloads/secure-claim`,
};
/*
import { REST_API } from "./index.js"; 


const BASE_PREFIX = REST_API;


const PUBLISH_PREFIX = `${REST_API}/publish-books`;

export const API = {
  
  GET_ADMIN_STATS: `${PUBLISH_PREFIX}/admin/stats`,
  ADMIN_BOOKS: (status) => `${PUBLISH_PREFIX}/admin/books?status=${status}`,
  CREATE_BOOK: `${PUBLISH_PREFIX}/admin/books`,
  GET_BOOK: (id) => `${PUBLISH_PREFIX}/admin/books/${id}`,

  
  PUBLISH_BOOK: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/publish`,
  UPDATE_CHAPTERS: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/chapters`,
  ADD_CHAPTER: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/chapters`,
  GET_CHAPTERS: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/chapters`,
  PREVIEW_BOOK: (id) => `${PUBLISH_PREFIX}/admin/books/${id}/preview`,
  UPDATE_CHAPTER: (bookId, chapterId) => 
    `${PUBLISH_PREFIX}/admin/books/${bookId}/chapters/${chapterId}`,

  
  STORE_BOOKS: `${PUBLISH_PREFIX}/store/books`,
  READER_VIEW: (id) => `${PUBLISH_PREFIX}/store/books/${id}`,

 
  RATE_BOOK: `${BASE_PREFIX}/rate`,        
  CART: `${BASE_PREFIX}/cart`,              
  TOGGLE_WISHLIST: `${BASE_PREFIX}/wishlist`, 
  
  SUBSCRIBE_NEWSLETTER: `${REST_API}/subscribe`,
  COMMENTS: `${REST_API}/comments`,
  TRENDING: `${REST_API}/trending`,
  INITIALIZE_PAYMENT: `${REST_API}/payments/initialize`,
  VERIFY_PAYMENT: `${REST_API}/payments/verify`,
  MY_BOOKS: `${REST_API}/me/books`,
};
*/