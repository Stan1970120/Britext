import { REST_API } from "./index"; // Import the one that has the fallback logic

export const API = {
  // Use REST_API instead of BASE
  CREATE_BOOK: `${REST_API}/admin/books`,

  ADMIN_BOOKS: (status) =>
    `${REST_API}/admin/books?status=${status}`,

  GET_BOOK: (id) =>
    `${REST_API}/admin/books/${id}`,

  ADD_CHAPTER: (id) =>
    `${REST_API}/admin/books/${id}/chapters`,

  GET_CHAPTERS: (id) =>
    `${REST_API}/admin/books/${id}/chapters`,

  PREVIEW_BOOK: (id) =>
    `${REST_API}/admin/books/${id}/preview`,

  PUBLISH_BOOK: (id) =>
    `${REST_API}/admin/books/${id}/publish`,
};