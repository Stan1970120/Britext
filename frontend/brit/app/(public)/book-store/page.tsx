"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, Star, Loader2, BookOpen } from "lucide-react"; // Added new icons
import { useRouter } from "next/navigation";
import { REST_API } from "../../constant"; 

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
  "All Books",
  "Educational",
  "Fiction",
  "Non-Fiction",
  "Professional & Technical",
  "Faith Based",
  "Lifestyle",
  "Journal & Notes",
];

const BookStore = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true); // ✨ Added Loading State
  
  const IMAGE_BASE = "https://britext.onrender.com";

  const fetchBooks = useCallback(async () => {
    setIsLoading(true); // Start loading
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const categoryQuery = selectedCategory !== "All Books" ? `?category=${selectedCategory}` : "";
      
      const res = await fetch(
        `${REST_API}/books${categoryQuery}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setIsLoading(false); // End loading
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  /* --------------------------- ACTIONS --------------------------- */
  const handleAddToCart = async (bookId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login"); // Optional: redirect if no token

    try {
      const res = await fetch(`${REST_API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) fetchBooks(); 
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };

  const handleWishlist = async (bookId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${REST_API}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) fetchBooks(); 
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
    }
  };

  const handleViewDetails = (bookId: string) => router.push(`/book-store/${bookId}`);

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png"; 
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE}/${path}`;
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Book Store</h1>
        {isLoading && <Loader2 className="animate-spin text-sky-500" size={24} />}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            disabled={isLoading}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-sky-500 text-white shadow-sm"
                : "bg-sky-50 text-gray-700 hover:bg-sky-100 disabled:opacity-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 bg-gray-100 rounded-xl border border-gray-200" />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book._id}
              className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition bg-white overflow-hidden relative flex flex-col group"
            >
              {/* Wishlist Button */}
              <button
                onClick={() => handleWishlist(book._id)}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition z-10"
              >
                <Heart
                  size={18}
                  className={`transition ${
                    book.isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 group-hover:text-red-400"
                  }`}
                />
              </button>

              {/* Book Image */}
              <div
                onClick={() => handleViewDetails(book._id)}
                className="flex justify-center items-center py-6 cursor-pointer bg-gray-50/50"
              >
                <div className="relative w-28 h-40 md:w-32 md:h-48 rounded-md shadow-md overflow-hidden border border-gray-100 bg-white group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={getImageUrl(book.coverImage)}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 112px, 128px"
                    className="object-cover rounded-md"
                  />
                </div>
              </div>

              {/* Book Details */}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                  {book.category} • <span className="text-sky-600">{book.author}</span>
                </p>

                <h2
                  onClick={() => handleViewDetails(book._id)}
                  className="text-sm font-bold text-gray-900 mb-2 cursor-pointer hover:text-sky-600 transition line-clamp-2 min-h-[40px]"
                >
                  {book.title}
                </h2>

                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={`transition ${
                        star <= Math.round(book.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">({book.rating?.toFixed(1) || "0.0"})</span>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-900 font-black text-base">${book.price?.toFixed(2) || "0.00"}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(book._id)}
                    disabled={book.isInCart}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg text-sm font-bold py-2.5 transition ${
                      book.isInCart
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
                    }`}
                  >
                    {book.isInCart ? "In Cart" : "Add to cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No books found</h3>
          <p className="text-gray-500">We couldn&apos;t find any published books in the &quot;{selectedCategory}&quot; category.</p>
        </div>
      )}
    </div>
  );
};

export default BookStore;