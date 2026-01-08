"use client";

import { useEffect, useState } from "react";
import { Book } from "../../types/books";
import { API } from "../../constant/api";
import BookTabs from "./components/BookTabs";
import BookCard from "./components/BookCard";
import EmptyState from "./components/EmptyState";

export default function AdminBooksPage() {
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    setLoading(true);
    const res = await fetch(API.ADMIN_BOOKS(status), {
      credentials: "include",
    });
    const data: Book[] = await res.json();
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooks();
  }, [status]);

  const publishBook = async (id: string) => {
    await fetch(API.PUBLISH_BOOK(id), {
      method: "PATCH",
      credentials: "include",
    });
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Books</h1>

        <a
          href="/create"
          className="bg-[#035b77] text-white px-6 py-3 rounded-full"
        >
          + New Book
        </a>
      </div>

      <BookTabs active={status} onChange={setStatus} />

      {loading ? (
        <p>Loading...</p>
      ) : books.length === 0 ? (
        <EmptyState text={`No ${status} books`} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onPublish={publishBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}
