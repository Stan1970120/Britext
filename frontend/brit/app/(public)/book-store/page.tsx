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
    <div className="p-6 md:p-12 bg-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Store</h1>
          
          {/* --- Categories Scrollable Row --- */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? "bg-[#5eb5c7] text-white shadow-md" 
                  : "bg-[#f1f5f9] text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* --- Books Grid --- */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {books.map((book) => (
              <div key={book._id} className="group flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[3.5/5] rounded-xl overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                  <Image 
                    src={book.coverImage || "/placeholder.png"} 
                    alt={book.title} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={(e) => handleWishlist(e, book._id)}
                    className="absolute top-3 right-3 p-1.5 transition-transform hover:scale-110"
                  >
                    <Heart size={22} className={`${book.isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 opacity-70"}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-gray-500 font-medium">
                      {book.category} - <span className="text-[#5eb5c7]">{book.author}</span>
                    </p>
                    <div className="flex items-center gap-0.5">
                       <Star size={12} className="fill-yellow-400 text-yellow-400" />
                       <span className="text-[11px] font-bold text-gray-400">{book.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-bold text-gray-900 mb-4 line-clamp-1">
                    {book.title}
                  </h3>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => handleAddToCart(e, book._id)}
                      disabled={book.isInCart}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                        book.isInCart 
                        ? "bg-green-100 text-green-600" 
                        : "bg-[#5eb5c7] text-white hover:bg-[#4a909e]"
                      }`}
                    >
                      {book.isInCart ? "Added to cart" : "Add to cart"}
                      {book.isInCart ? <Check size={14} /> : <ShoppingCart size={14} />}
                    </button>
                    <span className="text-lg font-bold text-gray-800">${book.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <h3 className="text-gray-400 font-medium">No books found in this category.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookStore;