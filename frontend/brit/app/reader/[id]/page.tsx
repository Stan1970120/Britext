"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { 
  ChevronLeft, Loader2, Menu, X, BookOpen, 
  Settings, Type, Sun, Moon, Coffee 
} from "lucide-react";
import { REST_API } from "../../constant";

interface Chapter {
  title: string;
  heading?: string;
  content: string;
  order: number;
}

interface BookDetail {
  _id: string;
  title: string;
  chapters: Chapter[];
}

// ✨ NEW: Theme Types
type ThemeMode = 'light' | 'sepia' | 'dark';

export default function ReaderPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // ✨ NEW: Reader Preferences
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<ThemeMode>('light');

  const fetchBookContent = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${REST_API}/publish-books/reader/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Access denied");
      const data = await res.json();
      setBook(data);
    } catch (err) {
      router.push("/my-books");
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  useEffect(() => { fetchBookContent(); }, [fetchBookContent]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setReadingProgress(progress);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#035b77]" size={40} />
    </div>
  );

  if (!book || !book.chapters || book.chapters.length === 0) return null;

  const currentChapter = book.chapters[activeChapter];

  // ✨ NEW: Dynamic Theme Styles
  const themeStyles = {
    light: "bg-[#fcfcfc] text-gray-800 border-gray-100 shadow-sm",
    sepia: "bg-[#f4ecd8] text-[#5b4636] border-[#eaddc0] shadow-none",
    dark: "bg-[#1a1a1a] text-[#d1d1d1] border-[#2a2a2a] shadow-none"
  };

  return (
    <div className={`flex h-screen overflow-hidden relative transition-colors duration-300 ${theme === 'dark' ? 'bg-[#121212]' : theme === 'sepia' ? 'bg-[#ebe3cf]' : 'bg-white'}`}>
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-sky-200 w-full z-[60]">
        <div className="h-full bg-[#035b77] transition-all duration-150" style={{ width: `${readingProgress}%` }} />
      </div>

      {/* Settings Popover */}
      {isSettingsOpen && (
        <div className="fixed top-16 right-6 w-72 bg-white rounded-3xl shadow-2xl z-[70] p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Reader Settings</h3>
            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
          </div>

          {/* Font Size Control */}
          <div className="space-y-3 mb-8">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Type size={14}/> Text Size: {fontSize}px
            </label>
            <input 
              type="range" min="14" max="32" value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#035b77]"
            />
          </div>

          {/* Theme Selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'sepia', 'dark'] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setTheme(m)}
                  className={`py-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${theme === m ? 'border-[#035b77] bg-sky-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                >
                  {m === 'light' && <Sun size={16} className="text-orange-400"/>}
                  {m === 'sepia' && <Coffee size={16} className="text-amber-700"/>}
                  {m === 'dark' && <Moon size={16} className="text-indigo-900"/>}
                  <span className="text-[10px] font-bold capitalize">{m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Settings Trigger */}
      <button 
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-[#035b77] text-white rounded-full shadow-2xl flex items-center justify-center z-[65] hover:scale-110 active:scale-95 transition-all"
      >
        <Settings size={24} className={isSettingsOpen ? "rotate-90" : ""} />
      </button>

      {/* --- Sidebar: Chapter List --- */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b flex flex-col gap-4">
          <button onClick={() => router.push("/my-books")} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#035b77] uppercase tracking-widest transition-colors">
            <ChevronLeft size={14} /> My Library
          </button>
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xl text-gray-900 line-clamp-2 leading-tight">{book.title}</h2>
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          {book.chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => { setActiveChapter(index); setIsSidebarOpen(false); setReadingProgress(0); }}
              className={`w-full text-left p-4 rounded-xl text-sm transition-all duration-200 ${activeChapter === index ? "bg-[#035b77] text-white shadow-lg" : "hover:bg-sky-50 text-gray-600"}`}
            >
              {(index + 1).toString().padStart(2, '0')} {chapter.title}
            </button>
          ))}
        </nav>
      </div>

      {/* --- Main Reading Surface --- */}
      <div className={`flex-1 flex flex-col overflow-y-auto scroll-smooth`} onScroll={handleScroll}>
        <div className="max-w-3xl mx-auto w-full py-12 md:py-20 px-6 md:px-12">
          <header className="mb-12 text-center space-y-4">
            <h1 className={`text-4xl md:text-6xl font-serif font-black leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {currentChapter?.title}
            </h1>
            <div className="w-12 h-1 bg-[#035b77] mx-auto mt-10 rounded-full opacity-20" />
          </header>

          <article className={`p-8 md:p-16 rounded-[2rem] border transition-all duration-300 ${themeStyles[theme]}`}>
            <div 
              className="prose prose-lg max-w-none font-serif leading-[1.8] first-letter:text-6xl first-letter:font-black first-letter:text-[#035b77] first-letter:mr-3 first-letter:float-left first-letter:mt-1"
              style={{ 
                fontSize: `${fontSize}px`, 
                whiteSpace: 'pre-wrap',
                color: 'inherit' // Inherits from themeStyles
              }}
            >
              {currentChapter?.content}
            </div>
          </article>

          {/* Navigation */}
          <div className="mt-16 py-12 border-t border-gray-100 flex items-center justify-between">
            <button 
              disabled={activeChapter === 0}
              onClick={() => { setActiveChapter(prev => prev - 1); document.querySelector('.flex-1')?.scrollTo(0,0); }}
              className={`px-8 py-4 rounded-2xl border-2 font-bold transition-all ${theme === 'dark' ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-500 hover:border-[#035b77]'}`}
            >
              Previous
            </button>
            <button 
              disabled={activeChapter === book.chapters.length - 1}
              onClick={() => { setActiveChapter(prev => prev + 1); document.querySelector('.flex-1')?.scrollTo(0,0); }}
              className="px-10 py-4 rounded-2xl bg-[#035b77] text-white font-bold shadow-xl hover:bg-[#024a61]"
            >
              Next Chapter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}