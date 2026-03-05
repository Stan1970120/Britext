"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, Star, Loader2, BookOpen, ShoppingCart, Check } from "lucide-react";
import { useRouter } from "next/navigation";
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

const categories = [
  "All Books", "Educational", "Fiction", "Non-Fiction", 
  "Professional & Technical", "Faith Based", "Lifestyle", "Journal & Notes",
];

const BookStore = () => {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const categoryParam = selectedCategory !== "All Books" 
        ? `?category=${encodeURIComponent(selectedCategory)}` 
        : "";
      
      const res = await fetch(`${REST_API}/publish-books/store/books${categoryParam}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, token]);

  useEffect(() => {
    if (!authLoading) fetchBooks();
  }, [fetchBooks, authLoading]);

  const updateLocalState = (bookId: string, updates: Partial<Book>) => {
    setBooks(current => current.map(b => b._id === bookId ? { ...b, ...updates } : b));
  };

  const handleAddToCart = async (e: React.MouseEvent, bookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return router.push("/login");

    updateLocalState(bookId, { isInCart: true });

    try {
      const res = await fetch(`${REST_API}/cart`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      updateLocalState(bookId, { isInCart: false });
      alert("Error updating cart");
    }
  };

  const handleWishlist = async (e: React.MouseEvent, bookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return router.push("/login");

    const book = books.find(b => b._id === bookId);
    const oldStatus = !!book?.isWishlisted;
    updateLocalState(bookId, { isWishlisted: !oldStatus });

    try {
      const res = await fetch(`${REST_API}/wishlist`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      updateLocalState(bookId, { isWishlisted: oldStatus });
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">The Library</h1>
            <p className="text-slate-500 mt-1 font-medium">Explore and collect your favorite reads.</p>
          </div>
          {(isLoading || authLoading) && <Loader2 className="animate-spin text-sky-600" size={28} />}
        </div>

        {/* --- Categories Grid (4 Columns Mobile, 8 Columns Desktop) --- */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-1 py-3 rounded-xl text-[9px] sm:text-xs font-bold transition-all duration-300 flex items-center justify-center text-center leading-tight shadow-sm ${
                selectedCategory === cat 
                ? "bg-sky-600 text-white shadow-sky-100 scale-105" 
                : "bg-white text-slate-600 hover:bg-sky-50 border border-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- Books Grid --- */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map((book) => (
              <div 
                key={book._id} 
                className="group relative bg-white rounded-3xl border border-slate-100 hover:border-sky-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                <div 
                  className="relative aspect-[3/4] m-3 rounded-2xl overflow-hidden bg-slate-50 cursor-pointer"
                  onClick={() => router.push(`/book-store/${book._id}`)}
                >
                  <Image 
                    src={book.coverImage || "/placeholder.png"} 
                    alt={book.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  
                  <button
                    onClick={(e) => handleWishlist(e, book._id)}
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm hover:bg-white transition-all z-20"
                  >
                    <Heart size={18} className={`${book.isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
                  </button>
                </div>

                <div className="p-5 pt-2 flex flex-col flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">
                    {book.category}
                  </span>
                  
                  <h3 
                    className="text-base font-bold text-slate-900 line-clamp-1 mb-1 cursor-pointer hover:text-sky-600 transition-colors"
                    onClick={() => router.push(`/book-store/${book._id}`)}
                  >
                    {book.title}
                  </h3>
                  
                  <p className="text-xs text-slate-400 font-medium mb-3">By {book.author}</p>

                  <div className="flex items-center gap-1 mb-4">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{book.rating?.toFixed(1) || "0.0"}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-slate-50">
                    <span className="text-lg font-black text-slate-900">${book.price?.toFixed(2)}</span>
                    <button
                      onClick={(e) => handleAddToCart(e, book._id)}
                      disabled={book.isInCart}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                        book.isInCart 
                        ? "bg-emerald-500 text-white shadow-emerald-100" 
                        : "bg-slate-900 text-white hover:bg-sky-600 shadow-lg shadow-slate-200"
                      }`}
                    >
                      {book.isInCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                      {book.isInCart ? "Added" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No books in this shelf</h3>
            <p className="text-slate-400 text-sm mt-2">Try selecting another category or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookStore;