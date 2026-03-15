"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Star, Loader2, ShoppingCart, Bookmark, ChevronRight, BookOpen, Share2 } from "lucide-react";
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
      const res = await fetch(`${REST_API}/publish-books/store/books/${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
        setRating(data.rating || 0);
      }
    } catch (error) {
      console.error("Failed to fetch book", error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

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

  if (!book) return <div className="h-screen flex items-center justify-center">Book not found.</div>;

  return (
    <section className="px-4 md:px-16 py-8 max-w-7xl mx-auto font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/book-store" className="hover:text-gray-600">Book</Link>
        <ChevronRight size={14} />
        <span className="hover:text-gray-600 cursor-pointer">{book.category}</span>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium truncate">{book.title}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left Column: Image and Secondary Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-xl border border-gray-100">
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
            <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Read summary
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Borrow book
            </button>
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <Bookmark size={18} /> Save for later
          </button>
        </div>

        {/* Right Column: Details and Purchase */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-[#2da5bd] text-sm font-medium">Author: by {book.author}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">{book.title}</h1>
              <p className="text-gray-400 text-sm">Edition: {book.publisher || "Standard"}, {book.publishedDate || "Oct 1, 2021"}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    fill={star <= Math.round(rating) ? "#facc15" : "none"} 
                    className={`${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"} cursor-pointer hover:scale-110 transition-transform`}
                    onClick={() => handleRatingClick(star)}
                  />
                ))}
                <span className="text-gray-400 text-sm ml-1 font-bold">{rating.toFixed(1)} (Ratings)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <span className="text-gray-300 line-through text-xl">${book.price + 250}</span>
            <span className="text-3xl font-bold text-gray-800">${book.price}</span>
            <div className="bg-yellow-400 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold">
              Discount <BookOpen size={10} />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-800 font-bold italic">“Start with Ambitious Anchors”</p>
            <p className="text-gray-800 font-bold italic">“Never Accept the First Offer”</p>
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              {book.summary || "Considered by many as the go to manual for negotiation, this book offers a masterclass in tactics, psychology, and leverage strategies..."}
            </p>
            <button className="text-[#2da5bd] text-sm font-bold flex items-center gap-1">
              Read more <ChevronRight size={16} />
            </button>
          </div>

          {/* Add to Cart Section */}
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 min-w-[200px] bg-[#2da5bd] text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#258a9e] transition-all shadow-lg shadow-cyan-100 disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
              Add to cart
            </button>
            
            <div className="flex items-center gap-4 border border-gray-200 rounded-full px-6 py-4">
              <span className="text-gray-400 text-sm">Quality :</span>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-8 text-center font-bold text-gray-700 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-10 border-t border-gray-100">
            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Print Length</p>
              <div className="flex flex-col items-center">
                <BookOpen size={20} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-600">{book.pages || "352"} Pages</p>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Language</p>
              <div className="flex flex-col items-center">
                <Share2 size={20} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-600">{book.language || "English"}</p>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Publisher</p>
              <div className="flex flex-col items-center">
                <Bookmark size={20} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-600">{book.publisher || "Career Press"}</p>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Date of publish</p>
              <div className="flex flex-col items-center">
                <BookOpen size={20} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-600">{book.publishedDate || "Sept-28-2020"}</p>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Dimensions</p>
              <div className="flex flex-col items-center">
                <Share2 size={20} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-600">{book.dimensions || "5.75 x 8.5 in"}</p>
              </div>
            </div>
          </div>
          
          <button className="text-[#2da5bd] text-sm font-bold flex items-center gap-1 pt-4">
            See Details <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}