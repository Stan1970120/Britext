"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
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
}

export default function BookDetails() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to get token without triggering extra renders
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#035b77]" size={40} />
    </div>
  );

  if (!book) return <div className="h-screen flex items-center justify-center">Book not found.</div>;

  return (
    <section className="px-4 md:px-10 py-10 max-w-7xl mx-auto font-sans animate-in fade-in duration-500">
      <Link href="/book-store" className="flex items-center gap-2 text-gray-500 mb-8 hover:text-[#035b77] transition-colors group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
      </Link>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl">
          <Image 
            src={book.coverImage || "/placeholder.png"} 
            alt={book.title} 
            fill 
            className="object-cover"
            priority 
          />
        </div>

        <div className="space-y-6">
          <span className="inline-block bg-sky-100 text-[#035b77] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            {book.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">{book.title}</h1>
          <p className="text-xl text-gray-600 font-medium">By {book.author}</p>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={24} 
                fill={star <= rating ? "#fbbf24" : "none"} 
                className={`transition-all ${star <= rating ? "text-amber-400" : "text-gray-300 hover:text-amber-200 cursor-pointer"}`}
                onClick={() => handleRatingClick(star)}
              />
            ))}
            <span className="text-gray-400 ml-2 font-medium">({book.numReviews} reviews)</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 tracking-widest">About this book</h3>
            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">{book.summary}</p>
          </div>

          <div className="pt-6 border-t flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-black tracking-tighter">Instant Access</p>
              <p className="text-4xl font-black text-[#035b77]">${book.price.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => router.push(`/payment?bookId=${book._id}`)}
              className="bg-[#035b77] text-white px-12 py-4 rounded-2xl font-bold hover:bg-[#024a61] transition-all shadow-xl hover:shadow-2xl active:scale-95"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}