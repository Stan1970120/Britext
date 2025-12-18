"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  oldPrice?: number | null;
  newPrice: number;
  rating: number;
  img: string;
}

const TrendingPost = () => {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<number[]>([]);

  // ⭐ Toggle favorite
  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id]
    );
  };

  // 🛒 Handle add to cart
  const handleAddToCart = (id: number) => {
    setCartItems((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  // ⭐ Handle rating (simulate update)
  const handleRating = (id: number, newRating: number) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === id ? { ...book, rating: newRating } : book
      )
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooks([
        {
          id: 1,
          title: "Decoded - The Science Behind Why We Buy",
          author: "Rory Sutherland",
          category: "Fictional",
          oldPrice: 600,
          newPrice: 500,
          rating: 2.5,
          img: "/images/Dont.jpg",
        },
        {
          id: 2,
          title: "Great Economic Thinkers",
          author: "Jonathan Conlin",
          category: "Fictional",
          oldPrice: 900,
          newPrice: 670,
          rating: 3.6,
          img: "/images/f&p.jpg",
        },
        {
          id: 3,
          title: "The Business of Choice",
          author: "Mathew Willcox",
          category: "Fictional",
          oldPrice: 300,
          newPrice: 100,
          rating: 2.9,
          img: "/images/l&f.jpg",
        },
        {
          id: 4,
          title: "Secret of Power Negotiating",
          author: "Roger Dawson",
          category: "Fictional",
          oldPrice: 1000,
          newPrice: 750,
          rating: 4.8,
          img: "/images/r&g.jpg",
        },
        {
          id: 5,
          title: "Creative Thinking",
          author: "Jonathan Conlin",
          category: "Fictional",
          oldPrice: 700,
          newPrice: 550,
          rating: 3.9,
          img: "/images/f&p.jpg",
        },
        {
          id: 6,
          title: "Unlocking Negotiation Skills",
          author: "Roger Dawson",
          category: "Fictional",
          oldPrice: 800,
          newPrice: 620,
          rating: 4.4,
          img: "/images/r&g.jpg",
        },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBookClick = (id: number) => {
    router.push(`/book-store/${id}`);
  };

  const handleViewAll = () => {
    router.push("/book-store");
  };

  return (
    <section className="w-[90%] mx-auto mt-15 py-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Trending Post</h2>
        <button
          onClick={handleViewAll}
          className="text-blue-600 hover:underline text-sm font-semibold"
        >
          View all →
        </button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <div className="h-44 bg-gray-200 w-full"></div>
                <div className="p-3 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-300 rounded mt-4"></div>
                </div>
              </div>
            ))
          : books.map((book) => {
              const isFavorited = favorites.includes(book.id);
              const isInCart = cartItems.includes(book.id);

              return (
                <motion.div
                  key={book.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden relative cursor-pointer border border-gray-200 transition-all duration-200"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                <div
  onClick={() => handleBookClick(book.id)}
  className="relative flex justify-center items-center py-6 bg-gradient-to-b from-gray-50 to-gray-100"
>
  <div className="relative w-32 h-44 md:w-40 md:h-56">
    <Image
      src={book.img}
      alt={book.title}
      fill
      className="object-cover rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.15)] border border-gray-200"
    />
  </div>

  {/* Subtle floor shadow effect */}
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-gray-400/40 blur-md rounded-full"></div>

  {/* Favorite icon */}
  <button
    className="absolute top-3 right-3 bg-white/80 rounded-full p-1 hover:bg-white transition"
    onClick={(e) => {
      e.stopPropagation();
      toggleFavorite(book.id);
    }}
  >
    <Heart
      size={18}
      fill={isFavorited ? "#FFD700" : "none"}
      className={`${
        isFavorited
          ? "text-yellow-400"
          : "text-gray-500 hover:text-yellow-500"
      }`}
    />
  </button>
</div>

                  {/* Book Info */}
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">
                      {book.category} –{" "}
                      <span className="text-gray-700">{book.author}</span>
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {book.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating(book.id, star);
                          }}
                        >
                          <span
                            className={`text-sm ${
                              star <= Math.round(book.rating)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        </button>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        {book.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-2">
                      {book.oldPrice && (
                        <span className="text-gray-400 line-through text-xs">
                          ${book.oldPrice}
                        </span>
                      )}
                      <span className="text-black font-semibold text-sm">
                        ${book.newPrice}
                      </span>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(book.id);
                      }}
                      className={`mt-3 w-full flex items-center justify-center gap-2 text-sm py-2 rounded-md transition ${
                        isInCart
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-sky-500 hover:bg-sky-600 text-white"
                      }`}
                      disabled={isInCart}
                    >
                      {isInCart ? "Added to Cart" : "Add to Cart"}{" "}
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default TrendingPost;