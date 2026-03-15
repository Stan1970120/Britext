"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Star, Loader2, ShoppingCart, Bookmark, ChevronRight, BookOpen, Globe, Building2, Calendar, Maximize } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { REST_API } from "../../../constant";

interface Book {
  _id: string;
  title: string;
  author: string;
  summary: string;
  coverImage: string;
  price: number;
  category: string;
  rating: number;
  numReviews: number;
  publisher?: string;
  publishedDate?: string;
  pages?: number;
  language?: string;
  dimensions?: string;
  discountPrice?: number;
}

export default function BookDetails() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const getAuthToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // ✅ FIX: Added Authorization header to prevent 403 if the endpoint is protected
      const res = await fetch(`${REST_API}/publish-books/store/books/${bookId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setBook(data);
        setRating(data.rating || 0);
      } else if (res.status === 403) {
        console.error("Access denied. Ensure you are hitting the correct store endpoint.");
      }
    } catch (error) {
      console.error("Failed to fetch book", error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (bookId) fetchBook();
  }, [fetchBook, bookId]);

  const handleRatingClick = async (value: number) => {
    const token = getAuthToken();
    if (!token) return alert("Please login to rate books");

    try {
      const res = await fetch(`${REST_API}/publish-books/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, rating: value }),
      });
      if (res.ok) setRating(value);
    } catch (error) {
      console.error("Failed to rate book", error);
    }
  };

  const handleAddToCart = async () => {
    const token = getAuthToken();
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
        alert("Added to cart successfully!");
      } else {
        throw new Error("Failed to add");
      }
    } catch (error) {
      alert("Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#2da5bd]" size={40} />
    </div>
  );

  if (!book) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500 font-medium">Book not found or access denied.</p>
      <button onClick={() => router.back()} className="text-[#2da5bd] flex items-center gap-2">
        <ArrowLeft size={18} /> Go Back
      </button>
    </div>
  );

  return (
    <section className="px-4 md:px-16 py-8 max-w-7xl mx-auto font-sans">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/book-store" className="hover:text-gray-600">Book</Link>
        <ChevronRight size={14} />
        <span className="hover:text-gray-600 cursor-pointer">{book.category}</span>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium truncate">{book.title}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-2xl border border-gray-100">
            <Image 
              src={book.coverImage || "/placeholder.png"} 
              alt={book.title} 
              fill 
              className="object-cover"
              priority 
              unoptimized
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Read summary
            </button>
            <button className="py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Borrow book
            </button>
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <Bookmark size={18} /> Save for later
          </button>

          {/* Author Small Profile */}
          <div className="flex items-center gap-3 pt-4">
            <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden relative">
               <Image src="/author-placeholder.png" alt={book.author} fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{book.author}</p>
              <p className="text-[10px] text-gray-400 uppercase font-black">Author</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[#2da5bd] text-sm font-bold">Author: by {book.author}</p>
              <h1 className="text-3xl md:text-5xl font-black text-gray-800 leading-tight">{book.title}</h1>
              <p className="text-gray-400 text-sm font-medium">Edition: {book.publisher}, Oct 1, 2021</p>
            </div>
            <div className="flex items-center gap-1 bg-white p-2 rounded-lg shadow-sm border border-gray-50">
                <Star size={18} fill="#facc15" className="text-yellow-400" />
                <span className="text-gray-800 text-sm font-black">{rating.toFixed(1)}</span>
                <span className="text-gray-400 text-[10px] ml-1">(Ratings)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <span className="text-gray-300 line-through text-xl font-medium">${book.price + 250}</span>
            <span className="text-4xl font-black text-gray-800">${book.price}</span>
            <div className="bg-orange-500 text-white text-[10px] px-3 py-1 rounded-md flex items-center gap-1 font-black shadow-sm shadow-orange-100 uppercase tracking-tighter">
              Discount <ShoppingCart size={10} />
            </div>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div className="space-y-1">
               {["Start with Ambitious Anchors", "Never Accept the First Offer", "Use the Flinch Technique"].map((tip, i) => (
                 <p key={i} className="text-gray-800 font-bold text-sm">“{tip}”</p>
               ))}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {book.summary}
            </p>
            <button className="text-[#2da5bd] text-sm font-bold flex items-center gap-1 hover:underline">
              Read more <ChevronRight size={16} />
            </button>
          </div>

          {/* Add to Cart Section */}
          <div className="flex flex-wrap items-center gap-4 pt-6">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-[2] min-w-[240px] bg-[#2da5bd] text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-[#258a9e] transition-all shadow-xl shadow-cyan-100 disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
              Add to cart
            </button>
            
            <div className="flex-1 flex items-center justify-between border border-gray-200 rounded-xl px-6 py-4 min-w-[160px]">
              <span className="text-gray-400 text-sm font-medium">Quality :</span>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-10 text-right font-black text-gray-700 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-12 border-t border-gray-100">
            <MetaItem label="Print Length" value={`${book.pages || 352} Pages`} icon={<BookOpen size={22} />} />
            <MetaItem label="Language" value={book.language || "English"} icon={<Globe size={22} />} />
            <MetaItem label="Publisher" value={book.publisher || "Career Press"} icon={<Building2 size={22} />} />
            <MetaItem label="Date of publish" value={book.publishedDate || "Sept-28-2020"} icon={<Calendar size={22} />} />
            <MetaItem label="Dimensions" value={book.dimensions || "5.75 x 8.5 in"} icon={<Maximize size={22} />} />
          </div>
          
          <button className="text-[#2da5bd] text-sm font-black flex items-center gap-1 pt-6 hover:gap-2 transition-all">
            See Details <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function MetaItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2 group">
      <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{label}</p>
      <div className="text-gray-300 group-hover:text-[#2da5bd] transition-colors">
        {icon}
      </div>
      <p className="text-[11px] font-bold text-gray-700 leading-tight">{value}</p>
    </div>
  );
}