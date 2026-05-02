"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader2, ShoppingCart, Heart, X, LogIn, UserPlus, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../../constant/api"; 
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

const categories = ["All Books", "Educational", "Fiction", "Non-Fiction", "Professional & Technical", "Faith Based", "Lifestyle", "Journal & Notes"];

const BookStore = () => {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = selectedCategory !== "All Books" 
        ? `${API.STORE_BOOKS}?category=${encodeURIComponent(selectedCategory)}` 
        : API.STORE_BOOKS;
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
    } catch (error) {
      console.error(`Fetch error at ${REST_API}:`, error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, token]);

  useEffect(() => { if (!authLoading) fetchBooks(); }, [fetchBooks, authLoading]);

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
      await fetch(API.TOGGLE_WISHLIST, {
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
      const res = await fetch(API.RATE_BOOK, {
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
      const res = await fetch(API.ADD_TO_CART, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      updateLocalState(bookId, { isInCart: false });
      console.error(`Cart update failed:`, error);
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen relative">
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
                    onClick={() => router.push("/login")}
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

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-slate-900">The Library</h1>
          {isLoading && <Loader2 className="animate-spin text-sky-600" />}
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-1 py-3 rounded-xl text-[10px] font-bold border transition-all ${
                selectedCategory === cat ? "bg-sky-600 text-white" : "bg-white text-slate-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {books.length === 0 && !isLoading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"
          >
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <BookOpen size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Empty Shelf</h2>
            <p className="text-gray-500 mt-2">We couldn&apos;t find any books in the <span className="font-semibold text-sky-600">{selectedCategory}</span> category.</p>
            <button 
              onClick={() => setSelectedCategory("All Books")}
              className="mt-6 text-sky-600 font-bold hover:underline"
            >
              Browse all books
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <motion.div 
                key={book._id} 
                whileHover={{ scale: 1.03 }}
                onClick={() => router.push(`/book-store/${book._id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden relative cursor-pointer border border-gray-200 transition-all duration-200 flex flex-col"
              >
                <div className="relative flex justify-center items-center py-6 bg-gradient-to-b from-gray-50 to-gray-100">
                  <div className="relative w-25 h-36 md:w-30 md:h-46">
                    <Image 
                      src={book.coverImage || "/placeholder.png"} 
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
                  <p className="text-xs text-gray-500 mb-1">{book.category} – {book.author}</p>
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

                  <div className="mt-2"><span className="text-black font-semibold text-sm">${book.price}</span></div>

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
      </div>
    </div>
  );
};

export default BookStore;
/*
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader2, ShoppingCart, Heart, X, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../../constant/api"; 
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

const categories = ["All Books", "Educational", "Fiction", "Non-Fiction", "Professional & Technical", "Faith Based", "Lifestyle", "Journal & Notes"];

const BookStore = () => {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = selectedCategory !== "All Books" 
        ? `${API.STORE_BOOKS}?category=${encodeURIComponent(selectedCategory)}` 
        : API.STORE_BOOKS;
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      
      let finalBooks = Array.isArray(data) ? data : [];

      // Merge Guest Data from LocalStorage if not logged in
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
    } catch (error) {
      console.error(`Fetch error at ${REST_API}:`, error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, token]);

  useEffect(() => { if (!authLoading) fetchBooks(); }, [fetchBooks, authLoading]);

  const updateLocalState = (bookId: string, updates: Partial<Book>) => {
    setBooks(current => current.map(b => b._id === bookId ? { ...b, ...updates } : b));
  };

  const toggleWishlist = async (e: React.MouseEvent, bookId: string, currentStatus: boolean) => {
    e.stopPropagation();
    
    // Always update UI immediately
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
      await fetch(API.TOGGLE_WISHLIST, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
    } catch (error) {
      // Revert UI on failure if logged in
      updateLocalState(bookId, { isWishlisted: currentStatus });
      console.error(`Wishlist toggle failed:`, error);
    }
  };

  const handleRatingClick = async (e: React.MouseEvent, bookId: string, value: number) => {
    e.stopPropagation(); 
    
    // Always update UI immediately
    updateLocalState(bookId, { rating: value });

    if (!token) {
      const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");
      guestRatings[bookId] = value;
      localStorage.setItem("guestRatings", JSON.stringify(guestRatings));
      return;
    }

    try {
      const res = await fetch(API.RATE_BOOK, {
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
    
    // Always update UI immediately
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
      const res = await fetch(API.ADD_TO_CART, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      updateLocalState(bookId, { isInCart: false });
      console.error(`Cart update failed:`, error);
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen relative">
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
                    onClick={() => router.push("/login")}
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

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-slate-900">The Library</h1>
          {isLoading && <Loader2 className="animate-spin text-sky-600" />}
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-1 py-3 rounded-xl text-[10px] font-bold border transition-all ${
                selectedCategory === cat ? "bg-sky-600 text-white" : "bg-white text-slate-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <motion.div 
              key={book._id} 
              whileHover={{ scale: 1.03 }}
              onClick={() => router.push(`/book-store/${book._id}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden relative cursor-pointer border border-gray-200 transition-all duration-200 flex flex-col"
            >
              <div className="relative flex justify-center items-center py-6 bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="relative w-25 h-36 md:w-30 md:h-46">
                  <Image 
                    src={book.coverImage || "/placeholder.png"} 
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
                <p className="text-xs text-gray-500 mb-1">{book.category} – {book.author}</p>
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

                <div className="mt-2"><span className="text-black font-semibold text-sm">${book.price}</span></div>

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
      </div>
    </div>
  );
};

export default BookStore;

*/