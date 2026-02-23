"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronLeft, List, Loader2, Menu, X } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  const fetchBookContent = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // ✅ ALIGNED: Hits the reader view endpoint we defined in the controller
      const res = await fetch(`${REST_API}/publish-books/store/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [id, token, router]);

  useEffect(() => {
    fetchBookContent();
  }, [fetchBookContent]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#035b77]" size={40} />
    </div>
  );

  if (!book || !book.chapters) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      
      {/* --- Sidebar: Chapter List --- */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <button 
              onClick={() => router.push("/my-books")}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#035b77] mb-2 uppercase tracking-widest"
            >
              <ChevronLeft size={14} /> My Library
            </button>
            <h2 className="font-black text-xl text-gray-900 line-clamp-2 leading-tight">{book.title}</h2>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {book.chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveChapter(index);
                setIsSidebarOpen(false); // Close sidebar on mobile after selection
              }}
              className={`w-full text-left p-4 rounded-xl text-sm transition-all duration-200 ${
                activeChapter === index 
                ? "bg-[#035b77] text-white shadow-lg shadow-sky-100 font-bold" 
                : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <span className="opacity-50 mr-2 text-xs">{(index + 1).toString().padStart(2, '0')}</span>
              {chapter.title}
            </button>
          ))}
        </div>
      </div>

      {/* --- Main Content: Reading Area --- */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#fcfcfc]">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b bg-white flex items-center justify-between sticky top-0 z-40">
           <button onClick={() => setIsSidebarOpen(true)}>
             <Menu size={24} className="text-[#035b77]" />
           </button>
           <span className="font-bold text-sm truncate px-4">{book.title}</span>
           <div className="w-6" /> {/* Spacer */}
        </div>

        <div className="max-w-3xl mx-auto w-full py-16 px-6 md:px-12">
          <header className="mb-12 text-center">
            <div className="inline-block px-3 py-1 bg-sky-50 text-[#035b77] rounded-full text-xs font-black tracking-widest uppercase mb-4">
              Chapter {activeChapter + 1}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 leading-tight">
              {book.chapters[activeChapter]?.title}
            </h1>
            <div className="w-20 h-1 bg-[#035b77] mx-auto mt-8 rounded-full opacity-20" />
          </header>

          {/* Reading Surface */}
          <article className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <div 
              className="prose prose-slate prose-lg max-w-none font-serif leading-[1.8] text-gray-800 
                first-letter:text-5xl first-letter:font-bold first-letter:text-[#035b77] 
                first-letter:mr-3 first-letter:float-left"
              dangerouslySetInnerHTML={{ __html: book.chapters[activeChapter]?.content || "" }}
            />
          </article>

          {/* Navigation Bottom */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
            <button 
              disabled={activeChapter === 0}
              onClick={() => {
                setActiveChapter(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-600 hover:border-[#035b77] hover:text-[#035b77] transition-all disabled:opacity-20"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            
            <div className="text-xs font-bold text-gray-400">
               {activeChapter + 1} / {book.chapters.length}
            </div>

            <button 
              disabled={activeChapter === book.chapters.length - 1}
              onClick={() => {
                setActiveChapter(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#035b77] text-white font-bold hover:bg-[#024a61] shadow-lg shadow-sky-100 transition-all disabled:opacity-20"
            >
              Next Chapter
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}