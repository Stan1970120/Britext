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

  const handleRatingClick = async (e: React.MouseEvent, bookId: string, value: number) => {
    e.preventDefault();
    e.stopPropagation(); // ⚡ Stops card navigation 404
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${REST_API}/publish-books/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, rating: value }),
      });
      if (res.ok) {
        const data = await res.json();
        updateLocalState(bookId, { rating: data.rating });
      }
    } catch (error) {
      console.error("Failed to rate book", error);
    }
  };

  const handleWishlist = async (e: React.MouseEvent, bookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return router.push("/login");

    const book = books.find(b => b._id === bookId);
    const newStatus = !book?.isWishlisted;
    updateLocalState(bookId, { isWishlisted: newStatus });

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
      updateLocalState(bookId, { isWishlisted: !newStatus });
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
                className="group relative bg-white rounded-2xl border border-slate-100 hover:border-sky-200 shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col"
              >
                {/* 🖼️ Reduced Book Cover size within card */}
                <div 
                  className="relative aspect-[4/5] mx-auto mt-4 w-[85%] rounded-lg overflow-hidden bg-slate-50 cursor-pointer shadow-md"
                  onClick={() => router.push(`/book-store/${book._id}`)}
                >
                  <Image 
                    src={book.coverImage || "/placeholder.png"} 
                    alt={book.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                  
                  <button
                    onClick={(e) => handleWishlist(e, book._id)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm hover:bg-white transition-all z-20"
                  >
                    <Heart size={16} className={`${book.isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[9px] font-bold text-slate-400 mb-1">
                    Fictional - <span className="text-sky-600">{book.author}</span>
                  </span>
                  
                  <h3 
                    className="text-sm font-bold text-slate-900 line-clamp-1 mb-2 cursor-pointer hover:text-sky-600 transition-colors"
                    onClick={() => router.push(`/book-store/${book._id}`)}
                  >
                    {book.title}
                  </h3>
                  
                  {/* ⭐ Interactive Rating Stars */}
                  <div className="flex items-center gap-0.5 mb-4" onClick={(e) => e.stopPropagation()}>
                    {[1, 2, 3, 4, 5].map((star) => (
                       <Star 
                        key={star}
                        size={12} 
                        onClick={(e) => handleRatingClick(e, book._id, star)}
                        className={`cursor-pointer transition-all hover:scale-125 ${
                          star <= Math.round(book.rating || 0) 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-slate-200"
                        }`} 
                      />
                    ))}
                    <span className="text-[10px] font-bold text-slate-400 ml-1">{book.rating?.toFixed(1) || "0.0"}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => handleAddToCart(e, book._id)}
                      disabled={book.isInCart}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        book.isInCart 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-sky-500 text-white hover:bg-sky-600 shadow-sm"
                      }`}
                    >
                      {book.isInCart ? <Check size={12} /> : <ShoppingCart size={12} />}
                      {book.isInCart ? "Added" : "Add to cart"}
                    </button>
                    <span className="text-sm font-bold text-slate-900">${book.price}</span>
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