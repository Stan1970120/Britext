"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link"; // Better than <a> for Next.js performance
import { Book } from "../../types/books";
import { API } from "@/app/constant/api";
import BookTabs from "./components/BookTabs";
import BookCard from "./components/BookCard";
import EmptyState from "./components/EmptyState";

// 1. New Component for KDP-style Overview Stats
const StatsOverview = ({ books }: { books: Book[] }) => {
  const published = books.filter((b) => b.status === "published").length;
  const drafts = books.filter((b) => b.status === "draft").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <p className="text-sm text-gray-500 uppercase font-bold">Total Catalog</p>
        <p className="text-3xl font-semibold">{books.length}</p>
      </div>
      <div className="p-6 bg-green-50 border border-green-100 rounded-xl shadow-sm">
        <p className="text-sm text-green-600 uppercase font-bold">Live on Store</p>
        <p className="text-3xl font-semibold text-green-700">{published}</p>
      </div>
      <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
        <p className="text-sm text-blue-600 uppercase font-bold">In Progress</p>
        <p className="text-3xl font-semibold text-blue-700">{drafts}</p>
      </div>
    </div>
  );
};

export default function AdminBooksPage() {
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [books, setBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]); // Storing all for stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Optimized Fetch with Error Handling (Fixes the .map() crash)
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(API.ADMIN_BOOKS(status), {
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Unauthorized: Please log in as Admin.");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch books");

      const data = await res.json();
      
      // Safety check: Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setBooks(data);
        // If it's the first load, we could fetch all books once for the stats
        if (allBooks.length === 0) setAllBooks(data); 
      } else {
        setBooks([]);
      }
    } catch (err) {
      setError("Could not connect to the server.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [status, allBooks.length]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const publishBook = async (id: string) => {
    try {
      const res = await fetch(API.PUBLISH_BOOK(id), {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) fetchBooks();
    } catch (err) {
      alert("Failed to publish book.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KDP Admin Dashboard</h1>
          <p className="text-gray-500">Manage your manuscript catalog and store presence.</p>
        </div>

        <Link
          href="/create"
          className="bg-[#035b77] hover:bg-[#024a61] text-white px-8 py-3 rounded-full transition-all shadow-md font-medium"
        >
          + Create New Title
        </Link>
      </div>

      {/* 3. Stats Section */}
      <StatsOverview books={allBooks.length > 0 ? allBooks : books} />

      <hr className="border-gray-200" />

      {/* 4. Tabs & Filter Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BookTabs active={status} onChange={setStatus} />
          <span className="text-sm text-gray-400 font-mono">
            Status: <span className="uppercase">{status}</span>
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#035b77]"></div>
          </div>
        ) : books.length === 0 ? (
          <EmptyState text={`You have no ${status} books yet.`} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
    </div>
  );
}