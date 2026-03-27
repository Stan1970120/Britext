"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, Loader2, ShoppingCart, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

  const toggleWishlist = async (e: React.MouseEvent, bookId: string, currentStatus: boolean) => {
    e.stopPropagation();
    if (!token) return router.push("/login");

    updateLocalState(bookId, { isWishlisted: !currentStatus });
    try {
      await fetch(API.TOGGLE_WISHLIST, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
    } catch (error) {
      updateLocalState(bookId, { isWishlisted: currentStatus });
    }
  };

  const handleRatingClick = async (e: React.MouseEvent, bookId: string, value: number) => {
    e.stopPropagation(); 
    if (!token) return router.push("/login");

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
    e.stopPropagation();
    
    // Always update local UI state immediately for responsiveness
    updateLocalState(bookId, { isInCart: true });

    try {
      const res = await fetch(API.ADD_TO_CART, {
        method: "POST",
        headers: token 
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } 
          : { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      // Guest logic: Store in localStorage if user is not signed in
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        if (!guestCart.includes(bookId)) {
          localStorage.setItem("guestCart", JSON.stringify([...guestCart, bookId]));
        }
      }

      if (!res.ok && token) throw new Error();
    } catch (error) {
      // Revert UI state only if logged in and request failed
      if (token) updateLocalState(bookId, { isInCart: false });
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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <motion.div 
              key={book._id} 
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push(`/book-store/${book._id}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden relative cursor-pointer border border-gray-200 transition-all duration-200 flex flex-col"
            >
              <div className="relative flex justify-center items-center py-6 bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="relative w-25 h-36 md:w-30 md:h-46">
                  <Image 
                    src={book.coverImage || "/placeholder.png"} 
                    alt={book.title} 
                    fill 
                    className="object-cover rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.15)] border border-gray-200"
                    unoptimized 
                  />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-gray-400/40 blur-md rounded-full"></div>

                <button
                  className="absolute top-3 right-3 bg-white/80 rounded-full p-1.5 hover:bg-white transition shadow-sm"
                  onClick={(e) => toggleWishlist(e, book._id, book.isWishlisted)}
                >
                  <Heart
                    size={18}
                    fill={book.isWishlisted ? "#FFD700" : "none"}
                    className={book.isWishlisted ? "text-yellow-400" : "text-gray-500"}
                  />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-gray-500 mb-1">
                  {book.category} – <span className="text-gray-700">{book.author}</span>
                </p>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">
                  {book.title}
                </h3>

                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button key={starValue} onClick={(e) => handleRatingClick(e, book._id, starValue)}>
                      <span className={`text-sm ${starValue <= Math.round(book.rating) ? "text-yellow-500" : "text-gray-300"}`}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{(book.rating || 0).toFixed(1)}</span>
                </div>

                <div className="mt-2">
                  <span className="text-black font-semibold text-sm">${book.price}</span>
                </div>

                <button
                  onClick={(e) => handleAddToCart(e, book._id)}
                  disabled={book.isInCart}
                  className={`mt-4 w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-md font-medium transition ${
                    book.isInCart
                      ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                      : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
                  }`}
                >
                  {book.isInCart ? "Added to Cart" : "Add to Cart"}
                  <ShoppingCart size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookStore;