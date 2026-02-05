"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, Star, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { REST_API } from "../../constant";
import { useAuth } from "@/app/context/AuthContext"; // ✨ Import useAuth

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
  const { token, loading: authLoading } = useAuth(); // ✨ Get token and auth status
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const IMAGE_BASE = "https://britext.onrender.com";

  const fetchBooks = useCallback(async () => {
    // 🛑 If Auth is still loading its state, wait.
    if (authLoading) return;

    setIsLoading(true);
    try {
      const categoryQuery = selectedCategory !== "All Books" ? `?category=${selectedCategory}` : "";
      const res = await fetch(`${REST_API}/books${categoryQuery}`, {
        headers: {
          // ✨ Use the token from AuthContext
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, token, authLoading]); // ✨ Add dependencies

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Actions... (handleAddToCart, handleWishlist, etc.)
  const handleAddToCart = async (bookId: string) => {
    if (!token) return router.push("/login");
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
    } catch (error) { /* error logic */ }
  };

  const handleWishlist = async (bookId: string) => {
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
    } catch (error) { /* error logic */ }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.png"; 
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE}/${path}`;
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Book Store</h1>
        {(isLoading || authLoading) && <Loader2 className="animate-spin text-sky-500" size={24} />}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category ? "bg-sky-500 text-white shadow-sm" : "bg-sky-50 text-gray-700 hover:bg-sky-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading || authLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-80 bg-gray-100 rounded-xl" />)}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book._id} className="rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
               {/* Simplified Book Render logic here for brevity */}
               <div className="relative w-full h-48 mb-4">
                  <Image src={getImageUrl(book.coverImage)} alt={book.title} fill className="object-contain" />
               </div>
               <h2 className="font-bold text-sm line-clamp-2">{book.title}</h2>
               <p className="text-xs text-gray-500 mt-1">{book.author}</p>
               <div className="mt-auto flex justify-between items-center pt-4">
                  <span className="font-bold">${book.price}</span>
                  <button 
                    onClick={() => handleAddToCart(book._id)}
                    className="bg-sky-500 text-white px-3 py-1 rounded text-xs"
                  >
                    {book.isInCart ? "In Cart" : "Add"}
                  </button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <BookOpen className="mx-auto text-gray-300 mb-2" />
          <p>No books found.</p>
        </div>
      )}
    </div>
  );
};

export default BookStore;