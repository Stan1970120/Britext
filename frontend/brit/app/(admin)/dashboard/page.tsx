'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Type Imports
import { DashboardStats, Transaction } from "@/app/types/analytics";
import { Book } from "@/app/types/books";

// Constant Imports
import { API } from "@/app/constant/api";

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
  
  // State for filtering books by status
  const [status, setStatus] = useState<"draft" | "published">("published"); 
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper to handle non-JSON responses and prevent crashes
   */
  const safeJsonResponse = async <T,>(response: Response): Promise<T | null> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    }
    const errorText = await response.text();
    console.error("Backend error (non-JSON):", errorText.substring(0, 200));
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

      // Using your existing API constants correctly
      const [booksRes, statsRes] = await Promise.all([
        fetch(API.ADMIN_BOOKS(status), { 
          method: "GET", 
          headers,
          credentials: "include" 
        }),
        fetch(API.GET_ADMIN_STATS, { 
          method: "GET", 
          headers,
          credentials: "include" 
        })
      ]);

      if (booksRes.status === 401 || statsRes.status === 401) {
        setError("Session unauthorized. Please log in again.");
        return;
      }

      const booksData = await safeJsonResponse<Book[]>(booksRes);
      const statsData = await safeJsonResponse<DashboardStats>(statsRes);

      if (!booksData || !statsData) {
        throw new Error("Invalid response format from server.");
      }

      setBooks(Array.isArray(booksData) ? booksData : []);
      setStats(statsData);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Network error occurred.";
      setError(errorMessage);
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [status, token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.replace("/signin");
      } else {
        fetchDashboardData();
      }
    }
  }, [fetchDashboardData, authLoading, token, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/signin");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-[#035b77] border-t-transparent rounded-full"></div>
          <p className="text-gray-500 font-medium tracking-tight">Loading Admin Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900">
      
      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#035b77]">Manuscript Hub</h1>
          <p className="text-gray-500 text-sm font-medium">Monitoring {books.length} active projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Logout
          </button>
          <Link href="/create" className="bg-[#035b77] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#024a61] transition-all flex items-center gap-2">
            <span>+</span> New Manuscript
          </Link>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="max-w-7xl mx-auto">
        <StatsOverview 
          draftCount={stats?.totalDrafts || 0} 
          liveCount={stats?.liveStoreCount || 0}
          revenue={stats?.dailyRevenue || 0}
          conversion={stats?.conversionRate || 0}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Books Management Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
              <BookTabs active={status} onChange={setStatus} />
            </div>

            {error ? (
              <div className="p-10 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                <p className="font-bold mb-2 tracking-tight text-lg">Connection Failure</p>
                <p className="text-sm mb-6 text-red-500/80">{error}</p>
                <button 
                  onClick={() => fetchDashboardData()}
                  className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-[#035b77] border-t-transparent rounded-full"></div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Synchronizing Data...</p>
              </div>
            ) : books.length === 0 ? (
              <EmptyState text={`No ${status} manuscripts found.`} />
            ) : (
              <div className="grid gap-4">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
             Recent Activity
          </h3>
          <div className="space-y-6">
            {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 italic font-medium">No sales transactions yet.</p>
              </div>
            ) : (
              stats.recentTransactions.map((tx: Transaction) => (
                <div key={tx._id} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0">
                  <div className="max-w-[160px]">
                    <p className="font-bold text-gray-900 text-sm truncate">{tx.bookTitle}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {new Date(tx.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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