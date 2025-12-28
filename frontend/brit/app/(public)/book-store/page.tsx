"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { REST_API } from "../../constant"; // make sure this points to your backend

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  image: string;
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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* --------------------------- FETCH BOOKS --------------------------- */
  const fetchBooks = async () => {
    try {
      const res = await fetch(
        `${REST_API}/books?category=${selectedCategory !== "All Books" ? selectedCategory : ""}`,
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
      if (res.ok) fetchBooks(); // refresh state
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
      if (res.ok) fetchBooks(); // refresh state
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
    }
  };

  const handleViewDetails = (bookId: string) => router.push(`/book-store/${bookId}`);

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
            className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition bg-white overflow-hidden relative"
          >
            {/* Wishlist */}
            <button
              onClick={() => handleWishlist(book._id)}
              className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-sm hover:bg-gray-100 transition"
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
              className="flex justify-center items-center py-6 cursor-pointer bg-gray-50"
            >
              <div className="relative w-28 h-40 md:w-32 md:h-48 rounded-md shadow-md overflow-hidden border border-gray-200 bg-white">
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-1">
                {book.category} – <span className="text-sky-600">{book.author}</span>
              </p>

              <h2
                onClick={() => handleViewDetails(book._id)}
                className="text-sm font-semibold text-gray-900 mb-2 cursor-pointer hover:text-sky-600 transition"
              >
                {book.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={`cursor-pointer transition ${
                      star <= Math.round(book.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">{book.rating.toFixed(1)}</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-800 font-semibold text-sm">${book.price}</span>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => handleAddToCart(book._id)}
                disabled={book.isInCart}
                className={`w-full flex items-center justify-center gap-2 rounded-md text-sm font-medium py-2 transition ${
                  book.isInCart
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-sky-500 hover:bg-sky-600 text-white"
                }`}
              >
                {book.isInCart ? "Added to cart 🛒" : "Add to cart 🛒"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookStore;
