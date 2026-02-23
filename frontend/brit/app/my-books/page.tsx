"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { BookOpen, Search, Loader2, Download, Library, History, Heart } from "lucide-react";
import { REST_API } from "../constant";

// ✨ FIXED: Added interface to replace 'any'
interface OwnedBook {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  category: string;
}

export default function MyBooksPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState<OwnedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchMyBooks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${REST_API}/publish-books/store/books`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (error) {
      console.error("Library load failed", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  const handleDownload = async (bookId: string) => {
    if (!token) return;
    setDownloadingId(bookId);
    try {
      const res = await fetch(`${REST_API}/publish-books/store/books/${bookId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      } else {
        alert("Download link could not be generated.");
      }
    } catch (err) {
      alert("Error initiating download.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#035b77]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">My Library</h1>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-all group">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={book.coverImage || "/placeholder.png"} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                    alt={book.title} 
                  />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => window.location.href = `/reader/${book._id}`}
                      className="flex items-center justify-center gap-2 bg-[#035b77] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#024a61] transition-colors"
                    >
                      <BookOpen size={14} /> Read
                    </button>
                    <button 
                      disabled={downloadingId === book._id}
                      onClick={() => handleDownload(book._id)}
                      className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {downloadingId === book._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
             <Library className="mx-auto text-gray-300 mb-4" size={48} />
             <p className="text-gray-500">Your library is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}