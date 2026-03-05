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

  // Logic for rating click (as requested, keeping logic but styling for UI)
  const handleRatingClick = (e: React.MouseEvent, bookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Your existing API rating logic would go here
    console.log("Rating clicked for:", bookId);
  };

  return (
    <div className="p-6 md:p-12 bg-[#fcfcfc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Store</h1>
          
          {/* --- Categories Pill Row --- */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                  ? "bg-[#46b1c9] text-white" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/5] bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {books.map((book) => (
              <div key={book._id} className="relative group flex flex-col bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Wishlist Button */}
                <button
                  onClick={(e) => handleWishlist(e, book._id)}
                  className="absolute top-5 right-5 z-10 p-1"
                >
                  <Heart 
                    size={20} 
                    className={`${book.isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} hover:scale-110 transition-transform`} 
                  />
                </button>

                {/* Book Cover */}
                <div 
                  className="relative aspect-[3.5/5] w-full rounded-xl overflow-hidden bg-gray-50 mb-4 cursor-pointer"
                  onClick={() => router.push(`/book-store/${book._id}`)}
                >
                  <Image 
                    src={book.coverImage || "/placeholder.png"} 
                    alt={book.title} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Info Section */}
                <div className="flex flex-col flex-1 px-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                      {book.category} - <span className="text-[#46b1c9] hover:underline cursor-pointer">{book.author}</span>
                    </p>
                    
                    {/* Rating Section - Clickable */}
                    <div 
                      className="flex items-center gap-0.5 cursor-pointer"
                      onClick={(e) => handleRatingClick(e, book._id)}
                    >
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <Star size={10} className="fill-gray-200 text-gray-200" />
                      <span className="text-[10px] ml-1 font-bold text-gray-400">{book.rating?.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-800 mb-4 line-clamp-1">
                    {book.title}
                  </h3>

                  {/* Actions Row */}
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => handleAddToCart(e, book._id)}
                      disabled={book.isInCart}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                        book.isInCart 
                        ? "bg-green-100 text-green-600" 
                        : "bg-[#46b1c9] text-white hover:bg-[#3990a4]"
                      }`}
                    >
                      <span>{book.isInCart ? "Added to cart" : "Add to cart"}</span>
                      <ShoppingCart size={14} />
                    </button>
                    
                    <span className="text-lg font-bold text-gray-800">
                      ${book.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
             <h3 className="text-gray-500 font-medium">This shelf is currently empty.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookStore;