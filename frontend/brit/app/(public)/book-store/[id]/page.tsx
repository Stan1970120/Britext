"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Star, Loader2, ShoppingCart, Bookmark, ChevronRight, BookOpen, Globe, Building2, Calendar, Maximize, X, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { API } from "../../../constant/api";
import { REST_API } from "../../../constant";

interface Book {
  _id: string;
  title: string;
  author: string;
  summary: string;
  coverImage: string;
  price: number;
  rating: number;
  category: string;
  pages?: number;
  language?: string;
  publisher?: string;
  publishedYear?: number;
  dimensions?: string;
}

export default function BookDetails() {
  const router = useRouter();
  const { id: bookId } = useParams();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(API.READER_VIEW(bookId as string), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      }
    } catch (error) {
      console.error("Failed to fetch book:", error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { 
    if (bookId) fetchBook(); 
  }, [fetchBook, bookId]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      setIsAdding(true);
      const res = await fetch(`${REST_API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, quantity }),
      });

      if (res.ok) {
        alert("Added to cart!");
      }
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveForLater = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    alert("Saved to your library!");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-sky-500" size={40} />
    </div>
  );

  if (!book) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <p className="text-slate-500 font-medium">Book not found.</p>
      <button onClick={() => router.back()} className="text-sky-600 flex items-center gap-2 font-bold">
        <ArrowLeft size={18} /> Go Back
      </button>
    </div>
  );

  return (
    <section className="px-6 md:px-16 py-8 max-w-7xl mx-auto bg-white relative">
      
      {/* Auth Modal Popup */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center text-sky-600 mb-6">
                <ShoppingCart size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Item added to cart!</h3>
              <p className="text-slate-500 font-medium mb-8">
                Create an account to save your library across all devices and proceed to checkout.
              </p>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => router.push("/auth")}
                  className="w-full py-4 bg-[#0081C9] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sky-700 transition-all"
                >
                  <LogIn size={20} /> Sign In
                </button>
                
                <button 
                  onClick={() => router.push("/signup")}
                  className="w-full py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <UserPlus size={20} /> Create Account
                </button>

                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4 hover:text-sky-600 transition-colors"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 mb-10">
        <Link href="/book-store" className="hover:text-sky-600 transition-colors">Store</Link> 
        <ChevronRight size={12} /> 
        <span className="text-slate-900">{book.title}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Floating Cover */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100">
            <Image 
              src={book.coverImage || "/placeholder.png"} 
              alt={book.title} 
              fill 
              className="object-cover" 
              unoptimized 
            />
          </div>
          <button 
            onClick={handleSaveForLater}
            className="w-full py-4 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
          >
            <Bookmark size={16} /> Save for later
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-8 space-y-6">
          <p className="text-sky-600 text-xs font-black uppercase tracking-widest">By {book.author}</p>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">{book.title}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.round(book.rating || 0) ? "currentColor" : "none"} 
                  className={i < Math.round(book.rating || 0) ? "text-amber-400" : "text-slate-200"}
                />
              ))}
            </div>
            <span className="font-black text-slate-900">{book.rating?.toFixed(1) || "0.0"}</span>
          </div>

          <div className="py-4">
            <span className="text-4xl font-black text-slate-900">${book.price}</span>
          </div>

          <p className="text-slate-500 leading-relaxed text-sm max-w-2xl">{book.summary}</p>

          <div className="flex flex-wrap items-center gap-6 pt-8">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 min-w-[200px] bg-slate-900 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-sky-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-70"
            >
              {isAdding ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />} 
              Add to cart
            </button>
            
            <div className="border border-slate-200 rounded-xl px-6 py-4 flex items-center gap-4">
              <span className="text-slate-400 font-bold text-xs whitespace-nowrap">Qty:</span>
              <input 
                type="number" 
                min="1"
                value={quantity} 
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} 
                className="w-8 font-black outline-none bg-transparent text-center" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-10 border-t border-slate-100">
            <MetaDetail icon={<BookOpen size={20}/>} label="Pages" value={book.pages || "N/A"} />
            <MetaDetail icon={<Globe size={20}/>} label="Language" value={book.language || "English"} />
            <MetaDetail icon={<Building2 size={20}/>} label="Publisher" value={book.publisher || "N/A"} />
            <MetaDetail icon={<Calendar size={20}/>} label="Published" value={book.publishedYear || "N/A"} />
            <MetaDetail icon={<Maximize size={20}/>} label="Dimensions" value={book.dimensions || "N/A"} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaDetail({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="text-slate-300">{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-[11px] font-bold text-slate-900">{value}</p>
    </div>
  );
}
/*
"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Star, Loader2, ShoppingCart, Bookmark, ChevronRight, BookOpen, Globe, Building2, Calendar, Maximize } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { API } from "../../../constant/api";
import { REST_API } from "../../../constant";

// 1. Define the interface to fix the 'any' error
interface Book {
  _id: string;
  title: string;
  author: string;
  summary: string;
  coverImage: string;
  price: number;
  rating: number;
  category: string;
  pages?: number;
  language?: string;
  publisher?: string;
  publishedDate?: string;
  dimensions?: string;
}

export default function BookDetails() {
  const router = useRouter();
  const { id: bookId } = useParams();
  
  // 2. Use the interface here instead of any
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(API.READER_VIEW(bookId as string), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      }
    } catch (error) {
      console.error("Failed to fetch book:", error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { 
    if (bookId) fetchBook(); 
  }, [fetchBook, bookId]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setIsAdding(true);
      const res = await fetch(`${REST_API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, quantity }),
      });

      if (res.ok) {
        alert("Added to cart!");
      }
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-sky-500" size={40} />
    </div>
  );

  if (!book) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <p className="text-slate-500 font-medium">Book not found.</p>
      <button onClick={() => router.back()} className="text-sky-600 flex items-center gap-2 font-bold">
        <ArrowLeft size={18} /> Go Back
      </button>
    </div>
  );

  return (
    <section className="px-6 md:px-16 py-8 max-w-7xl mx-auto bg-white">
     
      <nav className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 mb-10">
        <Link href="/book-store" className="hover:text-sky-600 transition-colors">Store</Link> 
        <ChevronRight size={12} /> 
        <span className="text-slate-900">{book.title}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-16">
        
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100">
            <Image 
              src={book.coverImage || "/placeholder.png"} 
              alt={book.title} 
              fill 
              className="object-cover" 
              unoptimized 
            />
          </div>
          <button className="w-full py-4 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
            <Bookmark size={16} /> Save for later
          </button>
        </div>

        
        <div className="lg:col-span-8 space-y-6">
          <p className="text-sky-600 text-xs font-black uppercase tracking-widest">By {book.author}</p>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">{book.title}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.round(book.rating || 0) ? "currentColor" : "none"} 
                  className={i < Math.round(book.rating || 0) ? "text-amber-400" : "text-slate-200"}
                />
              ))}
            </div>
            <span className="font-black text-slate-900">{book.rating?.toFixed(1) || "0.0"}</span>
          </div>

          <div className="py-4">
            <span className="text-4xl font-black text-slate-900">${book.price}</span>
          </div>

          <p className="text-slate-500 leading-relaxed text-sm max-w-2xl">{book.summary}</p>

          <div className="flex flex-wrap items-center gap-6 pt-8">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 min-w-[200px] bg-slate-900 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-sky-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-70"
            >
              {isAdding ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />} 
              Add to cart
            </button>
            
            <div className="border border-slate-200 rounded-xl px-6 py-4 flex items-center gap-4">
              <span className="text-slate-400 font-bold text-xs whitespace-nowrap">Qty:</span>
              <input 
                type="number" 
                min="1"
                value={quantity} 
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} 
                className="w-8 font-black outline-none bg-transparent text-center" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-10 border-t border-slate-100">
            <MetaDetail icon={<BookOpen size={20}/>} label="Pages" value={book.pages || 320} />
            <MetaDetail icon={<Globe size={20}/>} label="Language" value={book.language || "English"} />
            <MetaDetail icon={<Building2 size={20}/>} label="Publisher" value={book.publisher || "Global Press"} />
            <MetaDetail icon={<Calendar size={20}/>} label="Published" value={book.publishedDate || "2023"} />
            <MetaDetail icon={<Maximize size={20}/>} label="Dimensions" value={book.dimensions || "6 x 9 in"} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Reusable component for metadata to keep code clean
function MetaDetail({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="text-slate-300">{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-[11px] font-bold text-slate-900">{value}</p>
    </div>
  );
}
  */