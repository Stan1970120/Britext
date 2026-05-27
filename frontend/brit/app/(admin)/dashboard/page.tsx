'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Image as ImageIcon, Loader2, Trash2, CheckCircle, AlertTriangle, X, FileText, PlusCircle, ArrowUpRight } from "lucide-react"; 
// Type Imports
import { DashboardStats, Transaction } from "@/app/types/analytics";
import { Book } from "@/app/types/books";

// Constant Imports
import { REST_API } from "../../constant";

// Context Import
import { useAuth } from "@/app/context/AuthContext";

// Component Imports
import BookTabs from "./components/BookTabs";
import BookCard from "./components/BookCard";
import EmptyState from "./components/EmptyState";
import StatsOverview from "./components/StatsOverview";

export default function AdminDashboard() {
  const router = useRouter();
  const { logout, token, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"draft" | "published" | "broadcast" | "delete">("published");
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Blog Metrics State
  const [blogStats, setBlogStats] = useState({
    publishedCount: 0,
    outreach: 0,
    visitPercentage: 0
  });

  // UI States for Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [broadcastData, setBroadcastData] = useState({
    subject: "",
    title: "",
    message: "",
    imageUrl: ""
  });
  const [sending, setSending] = useState(false);

  const safeJsonResponse = async <T,>(response: Response): Promise<T | null> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    }
    return null;
  };

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const [booksRes, statsRes, blogStatsRes] = await Promise.all([
        fetch(`${REST_API}/publish-books/admin/books`, {
          method: "GET",
          headers
        }),
        fetch(`${REST_API}/publish-books/admin/stats`, {
          method: "GET",
          headers
        }),
        // Fetch real-time blog system analytics
        fetch(`${REST_API}/blogs/admin/metrics`, {
          method: "GET",
          headers
        }).catch(() => null) 
      ]);

      if (booksRes.status === 500 || statsRes.status === 500) {
        throw new Error("The server encountered an error (500). Please check backend logs.");
      }

      if (booksRes.status === 401 || statsRes.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      const booksData = await safeJsonResponse<Book[]>(booksRes);
      const statsData = await safeJsonResponse<DashboardStats>(statsRes);
      
      if (blogStatsRes && blogStatsRes.ok) {
        const blogData = await blogStatsRes.json();
        setBlogStats({
          publishedCount: blogData.publishedCount || 0,
          outreach: blogData.outreach || 0,
          visitPercentage: blogData.visitPercentage || 0
        });
      }

      if (booksData === null || statsData === null) {
        throw new Error("Invalid response format. Check API routes.");
      }

      setAllBooks(Array.isArray(booksData) ? booksData : []);
      setStats(statsData);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "A connection error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.replace("/signin");
      } else {
        fetchDashboardData();
      }
    }
  }, [fetchDashboardData, authLoading, token, router]);

  // Modal Trigger for Delete
  const initiateDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteBook = async () => {
    if (!token || !confirmDeleteId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${REST_API}/publish-books/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setAllBooks(prev => prev.filter(b => b._id !== confirmDeleteId));
        setConfirmDeleteId(null);
        setSuccessMessage("Book deleted permanently");
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSending(true);
    try {
      const res = await fetch(`${REST_API}/subscribe/broadcast`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(broadcastData),
      });
      if (res.ok) {
        setBroadcastData({ subject: "", title: "", message: "", imageUrl: "" });
        setSuccessMessage("Broadcast sent successfully!");
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/signin");
  };

  const filteredBooks = activeTab === "delete" 
    ? allBooks 
    : allBooks.filter(book => book.status === activeTab);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-sky-700 border-t-transparent rounded-full"></div>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">Verifying Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900 relative">
      
      {/* SUCCESS MODAL (TOAST STYLE) */}
      {showSuccessModal && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border border-slate-700">
            <div className="bg-emerald-500 p-1 rounded-full">
                <CheckCircle size={16} className="text-white" />
            </div>
            {successMessage}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center text-red-600 mb-6">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
                <p className="text-slate-500 font-medium mb-8">
                    This action is permanent. The book manuscript and all associated data will be removed from our servers.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteBook}
                        disabled={isDeleting}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <Loader2 className="animate-spin" size={18}/> : "Yes, Delete"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Manage manuscripts and monitor global performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-sm"
          >
            Logout
          </button>
          <Link href="/create" className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all flex items-center gap-2 text-sm">
            <span>+</span> New Manuscript
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto">
        <StatsOverview 
          draftCount={stats?.totalDrafts || 0} 
          liveCount={stats?.liveStoreCount || 0}
          revenue={stats?.dailyRevenue || 0}
          conversion={stats?.conversionRate || 0}
        />
      </div>

      {/*  Blog Management Cards Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Metrics Display & Outreach Target Navigation */}
        <div 
          onClick={() => router.push("/dashboard/blog-analytics")}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">EnjoyReads Insights</p>
              <h4 className="text-4xl font-black text-slate-900">
                {blogStats.publishedCount} <span className="text-lg font-bold text-slate-500">Blogs</span>
              </h4>
              <div className="flex items-center gap-4 pt-2">
                <div>
                  <span className="text-xs text-slate-400 block">Outreach</span>
                  <span className="text-sm font-bold text-slate-700">{blogStats.outreach.toLocaleString()} views</span>
                </div>
                <div className="border-l border-slate-200 h-8"></div>
                <div>
                  <span className="text-xs text-slate-400 block">Visit Rate</span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                    {blogStats.visitPercentage}% <span className="text-[10px]">avg</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-sky-50 text-sky-600 p-4 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
              <FileText size={24} />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* Quick Create Navigation */}
        <div 
          onClick={() => router.push("/dashboard/blogs/create")}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">Content Generation</p>
            <h4 className="text-2xl font-black text-slate-900">Create Search Blog</h4>
            <p className="text-slate-400 text-sm font-medium">Draft articles layout mirroring verified structural search headlines.</p>
          </div>
          <div className="bg-slate-50 text-slate-700 p-4 rounded-2xl group-hover:bg-sky-50 group-hover:text-sky-600 transition-all duration-300">
            <PlusCircle size={24} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <BookTabs active={activeTab} onChange={setActiveTab} />
            </div>

            {error ? (
              <div className="p-10 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                <p className="font-bold mb-2">Sync Error</p>
                <p className="text-sm mb-6">{error}</p>
                <button 
                  onClick={() => fetchDashboardData()}
                  className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-xs"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Records...</p>
              </div>
            ) : activeTab === "broadcast" ? (
              <form onSubmit={handleSendBroadcast} className="space-y-4 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Subject</label>
                    <input 
                      required value={broadcastData.subject}
                      onChange={(e) => setBroadcastData({...broadcastData, subject: e.target.value})}
                      placeholder="e.g. New arrival alert! 📚"
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input 
                      required value={broadcastData.title}
                      onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})}
                      placeholder="e.g. Discover our latest collection"
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2 flex items-center gap-1">
                    <ImageIcon size={12}/> Image URL (Optional)
                  </label>
                  <input 
                    value={broadcastData.imageUrl}
                    onChange={(e) => setBroadcastData({...broadcastData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Message</label>
                  <textarea 
                    required rows={6}
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                    placeholder="Write your email content here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                  />
                </div>
                <button 
                  disabled={sending}
                  type="submit"
                  className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-sky-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin"/> : <Send size={18}/>}
                  {sending ? "Sending..." : "Send Broadcast"}
                </button>
              </form>
            ) : filteredBooks.length === 0 ? (
              <EmptyState text={`No ${activeTab} books found in the database.`} />
            ) : (
              <div className="grid gap-6">
                {filteredBooks.map((book) => (
                  <div key={book._id} className="bg-white rounded-[1.5rem] border border-slate-100 hover:shadow-xl transition-all duration-300 p-2 flex flex-col">
                    <BookCard book={book} />
                    {activeTab === "delete" && (
                      <div className="px-6 pb-4 pt-2 flex justify-end">
                        <button 
                            onClick={() => initiateDelete(book._id)}
                            className="bg-red-50 text-red-600 py-2 px-6 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 flex items-center gap-2 font-black text-xs group"
                        >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                            Delete Permanent
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Sidebar */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              Recent Activity
          </h3>
          <div className="space-y-6">
            {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-slate-400 italic font-medium">No recent sales data available.</p>
              </div>
            ) : (
              stats.recentTransactions.map((tx: Transaction) => (
                <div key={tx._id} className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div className="max-w-[160px]">
                    <p className="font-bold text-slate-800 text-sm truncate">{tx.bookTitle}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-black text-emerald-600 text-sm">+${tx.amount.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
/*
'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Image as ImageIcon, Loader2, Trash2, CheckCircle, AlertTriangle, X } from "lucide-react"; 
// Type Imports
import { DashboardStats, Transaction } from "@/app/types/analytics";
import { Book } from "@/app/types/books";

// Constant Imports
import { REST_API } from "../../constant";

// Context Import
import { useAuth } from "@/app/context/AuthContext";

// Component Imports
import BookTabs from "./components/BookTabs";
import BookCard from "./components/BookCard";
import EmptyState from "./components/EmptyState";
import StatsOverview from "./components/StatsOverview";

export default function AdminDashboard() {
  const router = useRouter();
  const { logout, token, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"draft" | "published" | "broadcast" | "delete">("published");
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: UI States for Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [broadcastData, setBroadcastData] = useState({
    subject: "",
    title: "",
    message: "",
    imageUrl: ""
  });
  const [sending, setSending] = useState(false);

  const safeJsonResponse = async <T,>(response: Response): Promise<T | null> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    }
    return null;
  };

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const [booksRes, statsRes] = await Promise.all([
        fetch(`${REST_API}/publish-books/admin/books`, {
          method: "GET",
          headers
        }),
        fetch(`${REST_API}/publish-books/admin/stats`, {
          method: "GET",
          headers
        })
      ]);

      if (booksRes.status === 500 || statsRes.status === 500) {
        throw new Error("The server encountered an error (500). Please check backend logs.");
      }

      if (booksRes.status === 401 || statsRes.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      const booksData = await safeJsonResponse<Book[]>(booksRes);
      const statsData = await safeJsonResponse<DashboardStats>(statsRes);

      if (booksData === null || statsData === null) {
        throw new Error("Invalid response format. Check API routes.");
      }

      setAllBooks(Array.isArray(booksData) ? booksData : []);
      setStats(statsData);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "A connection error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.replace("/signin");
      } else {
        fetchDashboardData();
      }
    }
  }, [fetchDashboardData, authLoading, token, router]);

  // Modal Trigger for Delete
  const initiateDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteBook = async () => {
    if (!token || !confirmDeleteId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${REST_API}/publish-books/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setAllBooks(prev => prev.filter(b => b._id !== confirmDeleteId));
        setConfirmDeleteId(null);
        setSuccessMessage("Book deleted permanently");
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSending(true);
    try {
      const res = await fetch(`${REST_API}/subscribe/broadcast`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(broadcastData),
      });
      if (res.ok) {
        setBroadcastData({ subject: "", title: "", message: "", imageUrl: "" });
        setSuccessMessage("Broadcast sent successfully!");
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/signin");
  };

  const filteredBooks = activeTab === "delete" 
    ? allBooks 
    : allBooks.filter(book => book.status === activeTab);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-sky-700 border-t-transparent rounded-full"></div>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">Verifying Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900 relative">
      
     
      {showSuccessModal && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border border-slate-700">
            <div className="bg-emerald-500 p-1 rounded-full">
                <CheckCircle size={16} className="text-white" />
            </div>
            {successMessage}
          </div>
        </div>
      )}

      
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center text-red-600 mb-6">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
                <p className="text-slate-500 font-medium mb-8">
                    This action is permanent. The book manuscript and all associated data will be removed from our servers.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteBook}
                        disabled={isDeleting}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <Loader2 className="animate-spin" size={18}/> : "Yes, Delete"}
                    </button>
                </div>
            </div>
        </div>
      )}

      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Manage manuscripts and monitor global performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-sm"
          >
            Logout
          </button>
          <Link href="/create" className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all flex items-center gap-2 text-sm">
            <span>+</span> New Manuscript
          </Link>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto">
        <StatsOverview 
          draftCount={stats?.totalDrafts || 0} 
          liveCount={stats?.liveStoreCount || 0}
          revenue={stats?.dailyRevenue || 0}
          conversion={stats?.conversionRate || 0}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <BookTabs active={activeTab} onChange={setActiveTab} />
            </div>

            {error ? (
              <div className="p-10 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                <p className="font-bold mb-2">Sync Error</p>
                <p className="text-sm mb-6">{error}</p>
                <button 
                  onClick={() => fetchDashboardData()}
                  className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-xs"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Records...</p>
              </div>
            ) : activeTab === "broadcast" ? (
              <form onSubmit={handleSendBroadcast} className="space-y-4 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Subject</label>
                    <input 
                      required value={broadcastData.subject}
                      onChange={(e) => setBroadcastData({...broadcastData, subject: e.target.value})}
                      placeholder="e.g. New arrival alert! 📚"
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input 
                      required value={broadcastData.title}
                      onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})}
                      placeholder="e.g. Discover our latest collection"
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2 flex items-center gap-1">
                    <ImageIcon size={12}/> Image URL (Optional)
                  </label>
                  <input 
                    value={broadcastData.imageUrl}
                    onChange={(e) => setBroadcastData({...broadcastData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Message</label>
                  <textarea 
                    required rows={6}
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                    placeholder="Write your email content here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                  />
                </div>
                <button 
                  disabled={sending}
                  type="submit"
                  className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-sky-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin"/> : <Send size={18}/>}
                  {sending ? "Sending..." : "Send Broadcast"}
                </button>
              </form>
            ) : filteredBooks.length === 0 ? (
              <EmptyState text={`No ${activeTab} books found in the database.`} />
            ) : (
              <div className="grid gap-6">
                {filteredBooks.map((book) => (
                  <div key={book._id} className="bg-white rounded-[1.5rem] border border-slate-100 hover:shadow-xl transition-all duration-300 p-2 flex flex-col">
                    <BookCard book={book} />
                    {activeTab === "delete" && (
                      <div className="px-6 pb-4 pt-2 flex justify-end">
                        <button 
                            onClick={() => initiateDelete(book._id)}
                            className="bg-red-50 text-red-600 py-2 px-6 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 flex items-center gap-2 font-black text-xs group"
                        >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                            Delete Permanent
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

       
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              Recent Activity
          </h3>
          <div className="space-y-6">
            {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-slate-400 italic font-medium">No recent sales data available.</p>
              </div>
            ) : (
              stats.recentTransactions.map((tx: Transaction) => (
                <div key={tx._id} className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div className="max-w-[160px]">
                    <p className="font-bold text-slate-800 text-sm truncate">{tx.bookTitle}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-black text-emerald-600 text-sm">+${tx.amount.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react"; 
// Type Imports
import { DashboardStats, Transaction } from "@/app/types/analytics";
import { Book } from "@/app/types/books";

// Constant Imports
import { REST_API } from "../../constant";

// Context Import
import { useAuth } from "@/app/context/AuthContext";

// Component Imports
import BookTabs from "./components/BookTabs";
import BookCard from "./components/BookCard";
import EmptyState from "./components/EmptyState";
import StatsOverview from "./components/StatsOverview";

export default function AdminDashboard() {
  const router = useRouter();
  const { logout, token, loading: authLoading } = useAuth();
  
  // Updated state to include "broadcast"
  const [activeTab, setActiveTab] = useState<"draft" | "published" | "broadcast">("published");
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Broadcast Form State
  const [broadcastData, setBroadcastData] = useState({
    subject: "",
    title: "",
    message: "",
    imageUrl: ""
  });
  const [sending, setSending] = useState(false);

  const safeJsonResponse = async <T,>(response: Response): Promise<T | null> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    }
    return null;
  };

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const [booksRes, statsRes] = await Promise.all([
        fetch(`${REST_API}/publish-books/admin/books`, {
          method: "GET",
          headers
        }),
        fetch(`${REST_API}/publish-books/admin/stats`, {
          method: "GET",
          headers
        })
      ]);

      if (booksRes.status === 500 || statsRes.status === 500) {
        throw new Error("The server encountered an error (500). Please check backend logs.");
      }

      if (booksRes.status === 401 || statsRes.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      const booksData = await safeJsonResponse<Book[]>(booksRes);
      const statsData = await safeJsonResponse<DashboardStats>(statsRes);

      if (booksData === null || statsData === null) {
        throw new Error("Invalid response format. Check API routes.");
      }

      setAllBooks(Array.isArray(booksData) ? booksData : []);
      setStats(statsData);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "A connection error occurred.";
      setError(errorMessage);
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.replace("/signin");
      } else {
        fetchDashboardData();
      }
    }
  }, [fetchDashboardData, authLoading, token, router]);

  // NEW: Broadcast Submission Logic
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSending(true);
    try {
      const res = await fetch(`${REST_API}/subscribe/broadcast`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(broadcastData),
      });
      if (res.ok) {
        alert("Newsletter sent successfully!");
        setBroadcastData({ subject: "", title: "", message: "", imageUrl: "" });
      } else {
        alert("Failed to send newsletter.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/signin");
  };

  const filteredBooks = allBooks.filter(book => book.status === activeTab);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-sky-700 border-t-transparent rounded-full"></div>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">Verifying Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900">
      
     
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Manage manuscripts and monitor global performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-sm"
          >
            Logout
          </button>
          <Link href="/create" className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all flex items-center gap-2 text-sm">
            <span>+</span> New Manuscript
          </Link>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto">
        <StatsOverview 
          draftCount={stats?.totalDrafts || 0} 
          liveCount={stats?.liveStoreCount || 0}
          revenue={stats?.dailyRevenue || 0}
          conversion={stats?.conversionRate || 0}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
       
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <BookTabs active={activeTab} onChange={setActiveTab} />
            </div>

            {error ? (
              <div className="p-10 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                <p className="font-bold mb-2">Sync Error</p>
                <p className="text-sm mb-6">{error}</p>
                <button 
                  onClick={() => fetchDashboardData()}
                  className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-xs"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Records...</p>
              </div>
            ) : activeTab === "broadcast" ? (
             
              <form onSubmit={handleSendBroadcast} className="space-y-4 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Subject</label>
                    <input 
                      required value={broadcastData.subject}
                      onChange={(e) => setBroadcastData({...broadcastData, subject: e.target.value})}
                      placeholder="e.g. New arrival alert! 📚"
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input 
                      required value={broadcastData.title}
                      onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})}
                      placeholder="e.g. Discover our latest collection"
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2 flex items-center gap-1">
                    <ImageIcon size={12}/> Image URL (Optional)
                  </label>
                  <input 
                    value={broadcastData.imageUrl}
                    onChange={(e) => setBroadcastData({...broadcastData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Message</label>
                  <textarea 
                    required rows={6}
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                    placeholder="Write your email content here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                  />
                </div>
                <button 
                  disabled={sending}
                  type="submit"
                  className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-sky-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin"/> : <Send size={18}/>}
                  {sending ? "Sending..." : "Send Broadcast"}
                </button>
              </form>
            ) : filteredBooks.length === 0 ? (
              <EmptyState text={`No ${activeTab} books found in the database.`} />
            ) : (
              <div className="grid gap-4">
                {filteredBooks.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>

       
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
             Recent Activity
          </h3>
          <div className="space-y-6">
            {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-slate-400 italic font-medium">No recent sales data available.</p>
              </div>
            ) : (
              stats.recentTransactions.map((tx: Transaction) => (
                <div key={tx._id} className="flex justify-between items-start border-b border-slate-50 pb-4">
                  <div className="max-w-[160px]">
                    <p className="font-bold text-slate-800 text-sm truncate">{tx.bookTitle}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-black text-emerald-600 text-sm">+${tx.amount.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
  */