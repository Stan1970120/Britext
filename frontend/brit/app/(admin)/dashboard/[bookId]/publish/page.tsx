"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { REST_API } from "../../../../constant"; 

// ✨ Updated Interface to match your publishing logic
interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  coverImage: string; // Changed from 'image' to match Admin/Publish logic
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
  
  // Base URL for images stored on Render
  const IMAGE_BASE = "https://britext.onrender.com";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* --------------------------- FETCH BOOKS --------------------------- */
  const fetchBooks = async () => {
    try {
      // ✨ Updated URL to match your API constants: /publishbook/store/books
      const categoryParam = selectedCategory !== "All Books" ? `?category=${selectedCategory}` : "";
      const res = await fetch(
        `${REST_API}/publishbook/store/books${categoryParam}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooks();
  }, [selectedCategory]);

  /* --------------------------- CART / WISHLIST --------------------------- */
  const handleAddToCart = async (bookId: string) => {
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

  // Helper to resolve the image source correctly
  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder-book.png";
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE}/${path}`;
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">Book Store</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-sky-500 text-white shadow-sm"
                : "bg-sky-50 text-gray-700 hover:bg-sky-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <div
            key={book._id}
            className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition bg-white overflow-hidden relative flex flex-col"
          >
            {/* Wishlist */}
            <button
              onClick={() => handleWishlist(book._id)}
              className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition z-10"
              title="Add to wishlist"
            >
              <Heart
                size={18}
                className={`transition ${
                  book.isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            </button>

            {/* Book Image */}
            <div
              onClick={() => handleViewDetails(book._id)}
              className="flex justify-center items-center py-6 cursor-pointer bg-gray-50/50"
            >
              <div className="relative w-28 h-40 md:w-32 md:h-48 rounded-md shadow-md overflow-hidden border border-gray-100 bg-white">
                <Image
                  src={getImageUrl(book.coverImage)}
                  alt={book.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="p-4 flex flex-col flex-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                {book.category} • <span className="text-sky-600">{book.author || "Unknown Author"}</span>
              </p>

              <h2
                onClick={() => handleViewDetails(book._id)}
                className="text-sm font-bold text-gray-900 mb-2 cursor-pointer hover:text-sky-600 transition line-clamp-2 min-h-[40px]"
              >
                {book.title}
              </h2>

              {/* Rating */}
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

              {/* Price & Cart */}
              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-black text-base">
                    ${book.price ? book.price.toFixed(2) : "0.00"}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(book._id)}
                  disabled={book.isInCart}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg text-sm font-bold py-2.5 transition ${
                    book.isInCart
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#035b77] hover:bg-[#024a61] text-white shadow-sm"
                  }`}
                >
                  {book.isInCart ? "In Cart" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {books.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
           <p className="text-gray-500 font-medium">No books found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default BookStore;