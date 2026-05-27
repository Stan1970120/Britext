"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, X, Loader2, LogIn, UserPlus } from "lucide-react";
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
  isInCart: boolean;
  isWishlisted: boolean;
}

const TrendingPost = () => {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Helper to construct image URL
  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/400x600?text=No+Cover";
    if (path.startsWith("http")) return path;
    const baseUrl = REST_API.replace("/api", "");
    return `${baseUrl}/${path.startsWith("/") ? path.slice(1) : path}`;
  };

  useEffect(() => {
    const fetchTrending = async () => {
      if (authLoading) return;
      try {
        setLoading(true);
        const res = await fetch(`${REST_API}/trending`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          let finalBooks = Array.isArray(data) ? data : [];

          if (!token) {
            const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
            const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
            const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");

            finalBooks = finalBooks.map((b: Book) => ({
              ...b,
              isInCart: guestCart.includes(b._id),
              isWishlisted: guestWish.includes(b._id),
              rating: guestRatings[b._id] || b.rating
            }));
          }
          setBooks(finalBooks);
        }
      } catch (error) {
        console.error("Trending fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [token, authLoading]);

  const updateLocalState = (bookId: string, updates: Partial<Book>) => {
    setBooks(current => current.map(b => b._id === bookId ? { ...b, ...updates } : b));
  };

  const toggleWishlist = async (e: React.MouseEvent, bookId: string, currentStatus: boolean) => {
    e.stopPropagation();
    updateLocalState(bookId, { isWishlisted: !currentStatus });

    if (!token) {
      const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      const updated = currentStatus 
        ? guestWish.filter((id: string) => id !== bookId) 
        : [...guestWish, bookId];
      localStorage.setItem("guestWishlist", JSON.stringify(updated));
      return;
    }

    try {
      await fetch(`${REST_API}/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
    } catch (error) {
      updateLocalState(bookId, { isWishlisted: currentStatus });
      console.error(`Wishlist toggle failed:`, error);
    }
  };

  const handleRatingClick = async (e: React.MouseEvent, bookId: string, value: number) => {
    e.stopPropagation(); 
    updateLocalState(bookId, { rating: value });

    if (!token) {
      const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");
      guestRatings[bookId] = value;
      localStorage.setItem("guestRatings", JSON.stringify(guestRatings));
      return;
    }

    try {
      const res = await fetch(`${REST_API}/books/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId, rating: value }),
      });
      if (res.ok) {
        const data = await res.json();
        updateLocalState(bookId, { rating: data.rating });
      }
    } catch (error) {
      console.error(`Rating failed:`, error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    updateLocalState(bookId, { isInCart: true });

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      if (!guestCart.includes(bookId)) {
        guestCart.push(bookId);
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
      }
      setShowGuestModal(true);
      return;
    }

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
      console.error(`Cart update failed:`, error);
    }
  };

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
          {books.map((book) => (
            <motion.div
              key={book._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all flex flex-col h-full overflow-hidden relative cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push(`/book-store/${book._id}`)}
            >
              <div className="relative flex justify-center items-center py-6 bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="relative w-25 h-36 md:w-30 md:h-46">
                  <Image 
                    src={getImageUrl(book.img)} 
                    alt={book.title} 
                    fill 
                    className="object-cover rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.15)] border border-gray-200"
                    unoptimized 
                  />
                </div>
                <button
                  className="absolute top-3 right-3 bg-white/80 rounded-full p-1.5 hover:bg-white transition shadow-sm z-20"
                  onClick={(e) => toggleWishlist(e, book._id, book.isWishlisted)}
                >
                  <Heart
                    size={18}
                    fill={book.isWishlisted ? "#FFD700" : "none"}
                    className={book.isWishlisted ? "text-yellow-400" : "text-gray-500"}
                  />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-gray-500 mb-1">{book.author}</p>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">{book.title}</h3>
                
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      className="z-20"
                      onClick={(e) => handleRatingClick(e, book._id, star)}
                    >
                      <span className={`text-sm ${star <= Math.round(book.rating) ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                    </button>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{(book.rating || 0).toFixed(1)}</span>
                </div>

                <div className="mt-2">
                  <span className="text-black font-semibold text-sm">${book.newPrice}</span>
                </div>

                <button
                  onClick={(e) => handleAddToCart(e, book._id)}
                  disabled={book.isInCart}
                  className={`mt-4 w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-md font-medium transition z-20 ${
                    book.isInCart ? "bg-gray-200 text-gray-600" : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
                  }`}
                >
                  {book.isInCart ? "Added to Cart" : "Add to Cart"} 
                  <ShoppingCart size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showGuestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 relative"
            >
              <button 
                onClick={() => setShowGuestModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <div className="text-center">
                <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="text-sky-600" size={30} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Item added to cart!</h3>
                <p className="text-gray-500 mt-2 mb-6 text-sm">Create an account to save your library across all devices and proceed to checkout.</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => router.push("/auth")}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition"
                  >
                    <LogIn size={18} /> Sign In
                  </button>
                  <button 
                    onClick={() => router.push("/signup")}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-gray-700"
                  >
                    <UserPlus size={18} /> Create Account
                  </button>
                  <button 
                    onClick={() => setShowGuestModal(false)}
                    className="text-xs text-gray-400 mt-2 hover:underline"
                  >
                    Continue as Guest
                  </button>
                </div>
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