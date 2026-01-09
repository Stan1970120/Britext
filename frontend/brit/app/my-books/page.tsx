"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { 
  BookOpen, 
  Search, 
  Loader2, 
  Book as BookIcon, 
  Heart, 
  History, 
  Library 
} from "lucide-react";
import { REST_API } from "../constant";

interface OwnedBook {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  category: string;
}

type TabType = "purchased" | "saved" | "history";

export default function MyBooksPage() {
  const { token, user } = useAuth();
  const [books, setBooks] = useState<OwnedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("purchased");

  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // This endpoint should return books from completed orders
        const res = await fetch(`${REST_API}/user/my-library`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        }
      } catch (error) {
        console.error("Failed to load library", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [token]);

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#035b77]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        
        {/* SECTION 1: Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Collection</h1>
          <p className="text-gray-500 mt-1">Manage your library and reading progress.</p>
        </div>

        {/* SECTION 2: Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("purchased")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "purchased" 
                ? "bg-[#035b77] text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Library size={18} /> Purchased
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "saved" 
                ? "bg-[#035b77] text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Heart size={18} /> Saved
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "history" 
                ? "bg-[#035b77] text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <History size={18} /> History
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#035b77]/20 outline-none transition-all text-sm"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 3: Content Area */}
        {activeTab === "purchased" && (
          filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredBooks.map((book) => (
                <div 
                  key={book._id} 
                  className="group cursor-pointer"
                  onClick={() => window.location.href = `/reader/${book._id}`}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300 mb-4">
                    <img
                      src={book.coverImage || "/placeholder-book.png"}
                      alt={book.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                      <div className="bg-white text-[#035b77] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                         <BookOpen size={24} />
                      </div>
                      <span className="text-white font-bold text-sm">Open Reader</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#035b77] transition-colors">{book.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{book.author || "Admin"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookIcon size={32} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Your shelf is empty</h2>
              <p className="text-gray-500 mt-2 mb-8 max-w-xs mx-auto text-sm">You haven&apos;t purchased any books yet. Browse the store to get started.</p>
              <button 
                onClick={() => window.location.href = "/"}
                className="bg-[#035b77] text-white px-10 py-3 rounded-xl font-bold hover:bg-[#024a61] transition-all"
              >
                Go to Store
              </button>
            </div>
          )
        )}

        {activeTab === "saved" && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
             <Heart size={48} className="text-gray-200 mx-auto mb-4" />
             <h2 className="text-xl font-bold text-gray-800">No saved books</h2>
             <p className="text-gray-500 text-sm mt-2">Books you &quot;heart&quot; will appear here.</p>
          </div>
        )}

        {activeTab === "history" && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
             <History size={48} className="text-gray-200 mx-auto mb-4" />
             <h2 className="text-xl font-bold text-gray-800">No order history</h2>
             <p className="text-gray-500 text-sm mt-2">Your receipts will be displayed here.</p>
          </div>
        )}

      </div>
    </div>
  );
}