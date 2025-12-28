const BASE = process.env.NEXT_PUBLIC_API_URL;

export const API = {
  CREATE_BOOK: `${BASE}/api/admin/books`,

  ADMIN_BOOKS: (status) =>
    `${BASE}/api/admin/books?status=${status}`,

  GET_BOOK: (id) =>
    `${BASE}/api/admin/books/${id}`,

  ADD_CHAPTER: (id) =>
    `${BASE}/api/admin/books/${id}/chapters`,

  GET_CHAPTERS: (id) =>
    `${BASE}/api/admin/books/${id}/chapters`,

  PREVIEW_BOOK: (id) =>
    `${BASE}/api/admin/books/${id}/preview`,

  PUBLISH_BOOK: (id) =>
    `${BASE}/api/admin/books/${id}/publish`,
};
