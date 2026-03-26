"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { API } from "../../constant/api"; 
import { REST_API } from "../../constant";
import { useAuth } from "@/app/context/AuthContext";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  coverImage: string;
  isInCart: boolean;
  isWishlisted: boolean;
}

const categories = ["All Books", "Educational", "Fiction", "Non-Fiction", "Professional & Technical", "Faith Based", "Lifestyle", "Journal & Notes"];

const BookStore = () => {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = selectedCategory !== "All Books" 
        ? `${API.STORE_BOOKS}?category=${encodeURIComponent(selectedCategory)}` 
        : API.STORE_BOOKS;
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, token]);

  useEffect(() => { if (!authLoading) fetchBooks(); }, [fetchBooks, authLoading]);

  const updateLocalState = (bookId: string, updates: Partial<Book>) => {
    setBooks(current => current.map(b => b._id === bookId ? { ...b, ...updates } : b));
  };

  const handleRatingClick = async (e: React.MouseEvent, bookId: string, value: number) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (!token) return router.push("/login");

    // Optimistic UI update
    updateLocalState(bookId, { rating: value });

    try {
      const res = await fetch(API.RATE_BOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId, rating: value }),
      });
      if (res.ok) {
        const data = await res.json();
        updateLocalState(bookId, { rating: data.rating });
      }
    } catch (error) {
      console.error("Rating failed", error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, bookId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) return router.push("/login");
    
    updateLocalState(bookId, { isInCart: true });
    try {
      await fetch(`${REST_API}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
    } catch (error) {
      updateLocalState(bookId, { isInCart: false });
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-slate-900">The Library</h1>
          {isLoading && <Loader2 className="animate-spin text-sky-600" />}
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-1 py-3 rounded-xl text-[10px] font-bold border transition-all ${
                selectedCategory === cat ? "bg-sky-600 text-white" : "bg-white text-slate-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <div 
              key={book._id} 
              onClick={() => router.push(`/book-store/${book._id}`)}
              className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-all p-4 cursor-pointer"
            >
              <div className="relative aspect-[4/5] w-[85%] mx-auto mb-4 rounded-lg overflow-hidden shadow-md">
                <Image src={book.coverImage || "/placeholder.png"} alt={book.title} fill className="object-cover" unoptimized />
              </div>
              <h3 className="font-bold text-slate-900 truncate">{book.title}</h3>
              <p className="text-[10px] text-sky-600 font-bold mb-2">{book.author}</p>
              
              <div className="flex items-center gap-0.5 mb-4" onClick={(e) => e.stopPropagation()}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={14} 
                    onClick={(e) => handleRatingClick(e, book._id, star)}
                    className={`cursor-pointer ${star <= Math.round(book.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                  />
                ))}
                <span className="text-[10px] ml-1 text-slate-400">{(book.rating || 0).toFixed(1)}</span>
              </div>

              <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
                <button 
                  onClick={(e) => handleAddToCart(e, book._id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${book.isInCart ? "bg-emerald-50 text-emerald-600" : "bg-sky-500 text-white"}`}
                >
                  {book.isInCart ? "Added" : "Add to cart"}
                </button>
                <span className="font-bold text-slate-900">${book.price}</span>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && books.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400">No books found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookStore;