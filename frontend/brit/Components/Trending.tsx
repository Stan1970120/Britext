"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, X, Loader2 } from "lucide-react";
import { REST_API } from "@/app/constant";
import { useAuth } from "@/app/context/AuthContext";

interface Book {
  _id: string;
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

  // Helper to construct image URL
  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/400x600?text=No+Cover";
    if (path.startsWith("http")) return path;
    // Cleans up the REST_API URL to ensure it doesn't end with /api if images are served from root
    const baseUrl = REST_API.replace("/api", "");
    return `${baseUrl}/${path.startsWith("/") ? path.slice(1) : path}`;
  };

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
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (id: string) => {
    // Check authentication before allowing cart action
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    setCartItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleBookClick = (id: string) => router.push(`/book-store/${id}`);

  return (
    <section className="w-[90%] mx-auto mt-15 py-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Trending Post</h2>
        <button onClick={() => router.push("/book-store")} className="text-sky-600 hover:underline text-sm font-semibold">
          View all →
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">Curating the best books for you...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => {
            const isFavorited = favorites.includes(book._id);
            const isInCart = cartItems.includes(book._id);

            return (
              <motion.div
                key={book._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all flex flex-col h-full overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div 
                  onClick={() => handleBookClick(book._id)} 
                  className="relative h-64 w-full bg-gray-100 cursor-pointer overflow-hidden group"
                >
                  <Image 
                    src={getImageUrl(book.img)} 
                    alt={book.title} 
                    fill 
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized 
                  />
                  <button
                    className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-md hover:bg-white z-10"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(book._id); }}
                  >
                    <Heart size={18} fill={isFavorited ? "#0ea5e9" : "none"} className={isFavorited ? "text-sky-500" : "text-gray-400"} />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">
                    {book.category} • {book.author}
                  </p>
                  
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[40px] mb-2">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= Math.round(book.rating) ? "text-yellow-400" : "text-gray-200"}`}>
                        ★
                      </span>
                    ))}
                    <span className="text-xs font-medium text-gray-500 ml-1">{book.rating.toFixed(1)}</span>
                  </div>

                  <div className="mt-auto pt-2">
                    <div className="mb-3">
                      <span className="text-lg font-black text-gray-900">${book.newPrice}</span>
                    </div>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAddToCart(book._id); 
                      }}
                      className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition-all ${
                        isInCart 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-100"
                      }`}
                      disabled={isInCart}
                    >
                      {isInCart ? "In Cart" : "Add to Cart"} 
                      {!isInCart && <ShoppingCart size={16} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
                <X size={24}/>
              </button>
              <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="text-sky-500" size={32}/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Club</h3>
              <p className="text-gray-500 text-sm mb-8">Sign in to start building your personal library and manage your cart.</p>
              <div className="space-y-3">
                <button onClick={() => router.push("/auth")} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition">Sign In</button>
                <button onClick={() => router.push("/signup")} className="w-full py-3.5 border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">Create Account</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TrendingPost;
/*
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, X, Loader2 } from "lucide-react";
import { REST_API } from "@/app/constant";
import { useAuth } from "@/app/context/AuthContext";

interface Book {
  _id: string;
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

  return (
    <section className="w-[90%] mx-auto mt-15 py-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Trending Post</h2>
        <button onClick={() => router.push("/book-store")} className="text-sky-600 hover:underline text-sm font-semibold">
          View all →
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">Curating the best books for you...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => {
            const isFavorited = favorites.includes(book._id);
            const isInCart = cartItems.includes(book._id);

            return (
              <motion.div
                key={book._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all flex flex-col h-full overflow-hidden"
                whileHover={{ y: -5 }}
              >
                
                <div 
                  onClick={() => handleBookClick(book._id)} 
                  className="relative h-64 w-full bg-gray-100 cursor-pointer overflow-hidden group"
                >
                  <Image 
                    src={book.img || "https://placehold.co/400x600?text=No+Cover"} 
                    alt={book.title} 
                    fill 
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized // Helps if your external images are failing Next.js optimization
                  />
                  <button
                    className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-md hover:bg-white z-10"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(book._id); }}
                  >
                    <Heart size={18} fill={isFavorited ? "#0ea5e9" : "none"} className={isFavorited ? "text-sky-500" : "text-gray-400"} />
                  </button>
                </div>

               
                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">
                    {book.category} • {book.author}
                  </p>
                  
                 
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[40px] mb-2">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= Math.round(book.rating) ? "text-yellow-400" : "text-gray-200"}`}>
                        ★
                      </span>
                    ))}
                    <span className="text-xs font-medium text-gray-500 ml-1">{book.rating.toFixed(1)}</span>
                  </div>

                  
                  <div className="mt-auto pt-2">
                    <div className="mb-3">
                      <span className="text-lg font-black text-gray-900">${book.newPrice}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(book._id); }}
                      className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition-all ${
                        isInCart 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-100"
                      }`}
                      disabled={isInCart}
                    >
                      {isInCart ? "In Cart" : "Add to Cart"} 
                      {!isInCart && <ShoppingCart size={16} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
                <X size={24}/>
              </button>
              <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="text-sky-500" size={32}/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Club</h3>
              <p className="text-gray-500 text-sm mb-8">Sign in to start building your personal library and manage your cart.</p>
              <div className="space-y-3">
                <button onClick={() => router.push("/signin")} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition">Sign In</button>
                <button onClick={() => router.push("/signup")} className="w-full py-3.5 border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">Create Account</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TrendingPost;
*/