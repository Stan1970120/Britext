"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";

// Updated book data with proper categories
const initialBooks = [
  {
    id: 1,
    title: "How to Adult",
    author: "Stephen Wildish",
    category: "Lifestyle",
    price: 400,
    rating: 3.1,
    image: "/images/unshakle.jpg",
  },
  {
    id: 2,
    title: "99 Negotiating Strategies",
    author: "David Rosen",
    category: "Professional & Technical",
    price: 800,
    rating: 3.1,
    image: "/images/zero.jpg",
  },
  {
    id: 3,
    title: "An Anthology of Christian Mysticism",
    author: "John Rubysbreck",
    category: "Faith Based",
    price: 1500,
    rating: 2.5,
    image: "/images/spiritual.jpg",
  },
  {
    id: 4,
    title: "Modern Business Principles",
    author: "Lisa Green",
    category: "Educational",
    price: 950,
    rating: 4.2,
    image: "/images/l&f.jpg",
  },
  {
    id: 5,
    title: "The Silent River",
    author: "David Rosen",
    category: "Fiction",
    price: 700,
    rating: 4.0,
    image: "/images/zero.jpg",
  },
  {
    id: 6,
    title: "AI in Practice",
    author: "Mark Johnson",
    category: "Professional & Technical",
    price: 1300,
    rating: 4.6,
    image: "/images/ssc.jpg",
  },
  {
    id: 7,
    title: "Emotional Intelligence 101",
    author: "Sarah Lee",
    category: "Non-Fiction",
    price: 900,
    rating: 3.8,
    image: "/images/todler.jpg",
  },
  {
    id: 8,
    title: "Faith & Hope Devotional",
    author: "John Calvin",
    category: "Faith Based",
    price: 600,
    rating: 4.5,
    image: "/images/spiritual.jpg",
  },
  {
    id: 9,
    title: "Creative Journaling",
    author: "Mia Clarke",
    category: "Journal & Notes",
    price: 550,
    rating: 4.3,
    image: "/images/zero.jpg",
  },
  {
    id: 10,
    title: "Code Like a Pro",
    author: "Jason Yu",
    category: "Professional & Technical",
    price: 1100,
    rating: 4.7,
    image: "/images/ssc.jpg",
  },
];

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
  const [books, setBooks] = useState(initialBooks);
  const [cart, setCart] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Add to cart
  const handleAddToCart = (bookId: number) => {
    setCart((prev) => [...prev, bookId]);
  };

  // Wishlist toggle
  const handleWishlist = (bookId: number) => {
    setWishlist((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  // View details
  const handleViewDetails = (bookId: number) => {
    router.push(`/book-store/${bookId}`);
  };

  // Update rating
  const handleRating = (bookId: number, newRating: number) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === bookId ? { ...book, rating: newRating } : book
      )
    );
  };

  //  Category filtering
  const filteredBooks =
    selectedCategory === "All Books"
      ? books
      : books.filter((book) => book.category === selectedCategory);

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-white min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">Other Books</h1>

      {/* Category Tabs */}
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

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => {
          const isInCart = cart.includes(book.id);
          const isWishlisted = wishlist.includes(book.id);

          return (
            <div
              key={book.id}
              className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition bg-white overflow-hidden relative"
            >
              {/* Wishlist */}
              <button
                onClick={() => handleWishlist(book.id)}
                className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-sm hover:bg-gray-100 transition"
                title="Add to wishlist"
              >
                <Heart
                  size={18}
                  className={`transition ${
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                />
              </button>

              {/* Book Image */}
              <div
                onClick={() => handleViewDetails(book.id)}
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
                  {book.category} –{" "}
                  <span className="text-sky-600">{book.author}</span>
                </p>

                <h2
                  onClick={() => handleViewDetails(book.id)}
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
                      onClick={() => handleRating(book.id, star)}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {book.rating.toFixed(1)}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-800 font-semibold text-sm">
                    ${book.price}
                  </span>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(book.id)}
                  disabled={isInCart}
                  className={`w-full flex items-center justify-center gap-2 rounded-md text-sm font-medium py-2 transition ${
                    isInCart
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-sky-500 hover:bg-sky-600 text-white"
                  }`}
                >
                  {isInCart ? "Added to cart 🛒" : "Add to cart 🛒"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookStore;