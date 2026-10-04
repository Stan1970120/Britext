import { REST_API } from "./index.js";

const BASE_PREFIX = `${REST_API}/api`;
const PUBLISH_PREFIX = `${REST_API}/api/publish-books`;
const BLOG_PREFIX = `${REST_API}/api/blogs`;

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

  SUBSCRIBE_NEWSLETTER: `${BASE_PREFIX}/subscribe`,
  COMMENTS: `${BASE_PREFIX}/comments`,
  TRENDING: `${BASE_PREFIX}/trending`,

  INITIALIZE_PAYMENT: `${BASE_PREFIX}/payments/initialize`,
  VERIFY_PAYMENT: `${BASE_PREFIX}/payments/verify`,

  MY_BOOKS: (userId) => `${BASE_PREFIX}/users/${userId}/books`,

  BLOG_UPLOAD_S3: `${BLOG_PREFIX}/admin/upload-s3`,
  BLOG_CREATE: `${BLOG_PREFIX}/admin/create`,
  BLOG_GET_ALL_ADMIN: `${BLOG_PREFIX}/admin/all`,
  BLOG_DELETE_ADMIN: (id) => `${BLOG_PREFIX}/admin/${id}`,
  BLOG_METRICS: `${BLOG_PREFIX}/admin/metrics`,
  BLOG_PUBLIC_FEED: `${BLOG_PREFIX}/public/feed`,

  FLUTTERWAVE_INITIALIZE: `${BASE_PREFIX}/payments/create-flutterwave-session`,
  PAYMENT_VERIFY: `${BASE_PREFIX}/payments/verify`,
  PAYMENT_WEBHOOK: `${BASE_PREFIX}/payments/webhook`,

  DOWNLOAD_SECURE_CLAIM: `${BASE_PREFIX}/downloads/secure-claim`,
  DOWNLOAD_BOOK: (id) => `${BASE_PREFIX}/books/${id}/download`,
  GOOGLE_SYNC: `${BASE_PREFIX}/auth/google-sync`,

  MY_BOOKS: (userId) => `/api/books/user/${userId}`,
  DOWNLOAD_BOOK: (bookId) => `/api/books/${bookId}/download`,
  CART: `/api/cart`,
};
/*
import { REST_API } from "./index.js";

const BASE_PREFIX = `${REST_API}/api`;
const PUBLISH_PREFIX = `${REST_API}/api/publish-books`;
const BLOG_PREFIX = `${REST_API}/api/blogs`;

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

  SUBSCRIBE_NEWSLETTER: `${BASE_PREFIX}/subscribe`,
  COMMENTS: `${BASE_PREFIX}/comments`,
  TRENDING: `${BASE_PREFIX}/trending`,

  INITIALIZE_PAYMENT: `${BASE_PREFIX}/payments/initialize`,
  VERIFY_PAYMENT: `${BASE_PREFIX}/payments/verify`,

  
  MY_BOOKS: (userId) => `${BASE_PREFIX}/users/${userId}/books`,

 
  BLOG_UPLOAD_S3: `${BLOG_PREFIX}/admin/upload-s3`,
  BLOG_CREATE: `${BLOG_PREFIX}/admin/create`,
  BLOG_GET_ALL_ADMIN: `${BLOG_PREFIX}/admin/all`,
  BLOG_DELETE_ADMIN: (id) => `${BLOG_PREFIX}/admin/${id}`,
  BLOG_METRICS: `${BLOG_PREFIX}/admin/metrics`,
  BLOG_PUBLIC_FEED: `${BLOG_PREFIX}/public/feed`,

  
  FLUTTERWAVE_INITIALIZE: `${BASE_PREFIX}/payments/create-flutterwave-session`,
  PAYMENT_VERIFY: `${BASE_PREFIX}/payments/verify`,
  PAYMENT_WEBHOOK: `${BASE_PREFIX}/payments/webhook`,

  
  DOWNLOAD_SECURE_CLAIM: `${BASE_PREFIX}/downloads/secure-claim`,

  DOWNLOAD_BOOK: (id) => `${BASE_PREFIX}/books/${id}/download`,
  GOOGLE_SYNC: `${BASE_PREFIX}/auth/google-sync`,
  DOWNLOAD_BOOK: "/api/downloads/user-claim",

  MY_BOOKS: (userId: string) => `/api/books/user/${userId}`,
  DOWNLOAD_BOOK: (bookId: string) => `/api/books/${bookId}/download`,
  CART: `/api/cart`,
};


/*
import { REST_API } from "./index.js";

const BASE_PREFIX = REST_API;
const PUBLISH_PREFIX = `${REST_API}/publish-books`;
const BLOG_PREFIX = `${REST_API}/blogs`;

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

  
  MY_BOOKS: (userId) => `${REST_API}/users/${userId}/books`,

  
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


  GOOGLE_SYNC: `${REST_API}/auth/google-sync`,
};

*/