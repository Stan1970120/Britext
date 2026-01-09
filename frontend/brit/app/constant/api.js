import { REST_API } from "./index"; 

export const API = {
  // Book Management
  CREATE_BOOK: `${REST_API}/admin/books`,
  
  ADMIN_BOOKS: (status) => 
    `${REST_API}/admin/books?status=${status}`,

  GET_BOOK: (id) => 
    `${REST_API}/admin/books/${id}`,

  // Publishing Logic
  PUBLISH_BOOK: (id) => 
    `${REST_API}/admin/books/${id}/publish`,

  PREVIEW_BOOK: (id) => 
    `${REST_API}/admin/books/${id}/preview`,

  // Chapter Logic
  GET_CHAPTERS: (id) => 
    `${REST_API}/admin/books/${id}/chapters`,

  ADD_CHAPTER: (id) => 
    `${REST_API}/admin/books/${id}/chapters`,

  // Added: Specifically for PUT requests to a single chapter
  UPDATE_CHAPTER: (bookId, chapterId) => 
    `${REST_API}/admin/books/${bookId}/chapters/${chapterId}`,

  // Added: Essential for the Dashboard Cards and Transactions
  GET_ADMIN_STATS: `${REST_API}/admin/stats`,
};