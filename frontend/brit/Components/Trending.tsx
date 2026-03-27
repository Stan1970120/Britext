"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, X } from "lucide-react";
import { REST_API } from "@/app/constant";
import { useAuth } from "@/app/context/AuthContext";

interface Book {
  _id: string; // Changed from id: number to match MongoDB
  title: string;
  author: string;
  category: string;
  newPrice: number;
  rating: number;
  img: string;
}

const TrendingPost = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Fetch Real Data
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${REST_API}/trending`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        }
      } catch (error) {
        console.error("Trending fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const toggleFavorite = (id: string) => {
    if (!token) return setShowAuthModal(true);
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (id: string) => {
    if (!token) return setShowAuthModal(true);
    setCartItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRating = (id: string, newRating: number) => {
    if (!token) return setShowAuthModal(true);
    setBooks((prev) =>
      prev.map((b) => (b._id === id ? { ...b, rating: newRating } : b))
    );
  };

  const handleBookClick = (id: string) => router.push(`/book-store/${id}`);
  const handleViewAll = () => router.push("/book-store");

  return (
    <section className="w-[90%] mx-auto mt-15 py-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Trending Post</h2>
        <button onClick={handleViewAll} className="text-sky-600 hover:underline text-sm font-semibold">
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-80 border border-gray-100"></div>
            ))
        ) : (
          books.map((book) => {
            const isFavorited = favorites.includes(book._id);
            const isInCart = cartItems.includes(book._id);

            return (
              <motion.div
                key={book._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden relative cursor-pointer border border-gray-200 transition-all duration-200"
                whileHover={{ scale: 1.03 }}
              >
                <div onClick={() => handleBookClick(book._id)} className="relative flex justify-center items-center py-6 bg-gradient-to-b from-gray-50 to-gray-100">
                  <div className="relative w-32 h-44 md:w-40 md:h-56">
                    <Image src={book.img} alt={book.title} fill className="object-cover rounded-md shadow-lg border border-gray-200" />
                  </div>
                  <button
                    className="absolute top-3 right-3 bg-white/80 rounded-full p-1 hover:bg-white transition"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(book._id); }}
                  >
                    <Heart size={18} fill={isFavorited ? "#0ea5e9" : "none"} className={isFavorited ? "text-sky-500" : "text-gray-500"} />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{book.category} – <span className="text-gray-700">{book.author}</span></p>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={(e) => { e.stopPropagation(); handleRating(book._id, star); }}>
                        <span className={`text-sm ${star <= Math.round(book.rating) ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                      </button>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{book.rating.toFixed(1)}</span>
                  </div>
                  <div className="mt-2"><span className="text-black font-semibold text-sm">${book.newPrice}</span></div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(book._id); }}
                    className={`mt-3 w-full flex items-center justify-center gap-2 text-sm py-2 rounded-md transition ${isInCart ? "bg-gray-200 text-gray-500" : "bg-sky-500 hover:bg-sky-600 text-white"}`}
                    disabled={isInCart}
                  >
                    {isInCart ? "Added" : "Add to Cart"} <ShoppingCart size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-sky-600" size={28}/>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Join BriText</h3>
              <p className="text-gray-500 text-sm mb-6">Sign in to manage your cart, save favorites, and explore thousands of books.</p>
              <div className="space-y-3">
                <button onClick={() => router.push("/signin")} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition">Sign In</button>
                <button onClick={() => router.push("/signup")} className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">Create Account</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TrendingPost;