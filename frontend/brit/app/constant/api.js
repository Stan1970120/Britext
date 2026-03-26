import { REST_API } from "./index.js"; 


const PREFIX = `${REST_API}/publish-books`;

export const API = {
  /*  DASHBOARD & ADMIN
      */
  GET_ADMIN_STATS: `${PREFIX}/admin/stats`,
  ADMIN_BOOKS: (status) => `${PREFIX}/admin/books?status=${status}`,
  CREATE_BOOK: `${PREFIX}/admin/books`,
  GET_BOOK: (id) => `${PREFIX}/admin/books/${id}`,

  /*  PUBLISHING & CHAPTERS
      */
  PUBLISH_BOOK: (id) => `${PREFIX}/admin/books/${id}/publish`,
  UPDATE_CHAPTERS: (id) => `${PREFIX}/admin/books/${id}/chapters`,
  ADD_CHAPTER: (id) => `${PREFIX}/admin/books/${id}/chapters`,
  GET_CHAPTERS: (id) => `${PREFIX}/admin/books/${id}/chapters`,
  UPDATE_CHAPTER: (bookId, chapterId) => `${PREFIX}/admin/books/${bookId}/chapters/${chapterId}`,

  /* PUBLIC STORE & READER VIEW
      */
  STORE_BOOKS: `${PREFIX}/store/books`,
  READER_VIEW: (id) => `${PREFIX}/store/books/${id}`,

  /*  USER INTERACTIONS
      */
  RATE_BOOK: `${PREFIX}/rate`, 
};