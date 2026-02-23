"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Plus, 
  BarChart3, 
  Layers, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { REST_API } from "../../constant";
import { useAuth } from "@/app/context/AuthContext";

// 1. Defined Interfaces (Fixes the "any" ESLint error)
interface Book {
  _id: string;
  title: string;
  author?: string;
  coverImage?: string;
  category: string;
  price: number;
  createdAt: string;
}

interface DashboardStats {
  totalBooks: number;
  totalChapters: number;
  categories: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  
  // 2. State management with explicit types
  const [stats, setStats] = useState<DashboardStats>({ 
    totalBooks: 0, 
    totalChapters: 0, 
    categories: 0 
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Don't fetch if the auth context is still loading the token
      if (authLoading) return;
      
      // If no token exists, the session is invalid
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [statsRes, booksRes] = await Promise.all([
          fetch(`${REST_API}/publish-books/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${REST_API}/publish-books/admin/books`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.ok && booksRes.ok) {
          const statsData = await statsRes.json();
          const booksData = await booksRes.json();
          setStats(statsData);
          setBooks(booksData);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, authLoading, router]);

  // 3. Professional Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-sky-600" size={40} />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">Admin</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">V2.4 Control Panel</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Manuscript Hub</h1>
            <p className="text-slate-500 font-medium">Overview of your published works and reader engagement.</p>
          </div>
          <Link 
            href="/create" 
            className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} strokeWidth={3} /> New Project
          </Link>
        </div>

        {/* --- Metrics Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: "Total Library", value: stats.totalBooks, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Content Nodes", value: stats.totalChapters, icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Active Genres", value: stats.categories || 0, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className={`${item.bg} ${item.color} p-5 rounded-3xl`}>
                <item.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-3xl font-black text-slate-900 leading-none">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- Inventory Table --- */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-sky-500" size={20} />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Inventory</h2>
            </div>
            <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
              {books.length} Entries
            </div>
          </div>

          {books.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Title</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {books.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-10 bg-slate-200 rounded-lg overflow-hidden relative border border-slate-100 shadow-sm">
                             {book.coverImage ? (
                               <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                             ) : (
                               <div className="flex items-center justify-center h-full"><BookOpen size={14} className="text-slate-400"/></div>
                             )}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base">{book.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {book._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black text-sky-700 bg-sky-100 px-3 py-1 rounded-full uppercase">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-10 py-6 font-black text-slate-800">
                        ${book.price?.toFixed(2)}
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => router.push(`/book-store/${book._id}`)}
                            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-sky-600 hover:bg-sky-50 transition-all"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                             onClick={() => router.push(`/create?edit=${book._id}`)}
                             className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-all"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <BookOpen className="text-slate-300" size={32} />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Your library is empty</h3>
              <p className="text-slate-400 max-w-xs mx-auto mb-8 font-medium">You haven&apos;t added any digital manuscripts to your inventory yet.</p>
              <Link href="/create" className="text-sky-600 font-black text-xs uppercase tracking-[0.2em] hover:text-sky-700">
                + Initialise Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}