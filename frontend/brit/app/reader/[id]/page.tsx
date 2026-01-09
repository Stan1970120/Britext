"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronLeft, List, Loader2, BookOpen } from "lucide-react";
import { REST_API } from "../../constant";

interface Chapter {
  title: string;
  content: string;
  order: number;
}

interface BookDetail {
  _id: string;
  title: string;
  chapters: Chapter[];
}

export default function ReaderPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookContent = async () => {
      try {
        const res = await fetch(`${REST_API}/books/${id}/read`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Access denied or book not found");
        
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error(err);
        router.push("/my-books");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBookContent();
  }, [id, token, router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#035b77]" size={40} />
    </div>
  );

  if (!book) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar: Chapter List */}
      <div className="w-80 border-r border-gray-100 flex flex-col hidden md:flex">
        <div className="p-6 border-b">
          <button 
            onClick={() => router.push("/my-books")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4"
          >
            <ChevronLeft size={16} /> Back to Library
          </button>
          <h2 className="font-bold text-xl line-clamp-2">{book.title}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {book.chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setActiveChapter(index)}
              className={`w-full text-left p-3 rounded-xl text-sm transition ${
                activeChapter === index 
                ? "bg-[#035b77]/10 text-[#035b77] font-bold" 
                : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              {index + 1}. {chapter.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Reading Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full py-12 px-6">
          <header className="mb-10 text-center">
            <span className="text-[#035b77] font-bold text-sm tracking-widest uppercase">
              Chapter {activeChapter + 1}
            </span>
            <h1 className="text-4xl font-serif font-bold mt-2">
              {book.chapters[activeChapter]?.title}
            </h1>
          </header>

          {/* This renders the actual book content */}
          <div 
            className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: book.chapters[activeChapter]?.content || "" }}
          />

          {/* Navigation Bottom */}
          <div className="mt-20 pt-10 border-t flex justify-between">
            <button 
              disabled={activeChapter === 0}
              onClick={() => setActiveChapter(prev => prev - 1)}
              className="px-6 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
            >
              Previous
            </button>
            <button 
              disabled={activeChapter === book.chapters.length - 1}
              onClick={() => setActiveChapter(prev => prev + 1)}
              className="px-6 py-2 rounded-lg bg-[#035b77] text-white hover:opacity-90 disabled:opacity-30"
            >
              Next Chapter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}