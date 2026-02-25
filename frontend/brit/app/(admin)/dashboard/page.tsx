'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Type Imports
import { DashboardStats, Transaction } from "@/app/types/analytics";
import { Book } from "@/app/types/books";

// Constant Imports
import { REST_API } from "../../constant"; // Use the direct REST_API string

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
  
  // State for filtering books by status (Draft vs Published)
  const [status, setStatus] = useState<"draft" | "published">("published"); 
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper to handle non-JSON responses (Prevents the "Unexpected token <" error)
   */
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

      // Direct fetching using the hyphenated path 'publish-books'
      // This solves the 404 issue seen in your logs
      const [booksRes, statsRes] = await Promise.all([
        fetch(`${REST_API}/publish-books/admin/books?status=${status}`, { 
          method: "GET", 
          headers 
        }),
        fetch(`${REST_API}/publish-books/admin/stats`, { 
          method: "GET", 
          headers 
        })
      ]);

      // Check for Internal Server Error (500)
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
        throw new Error("Invalid response format (HTML returned instead of JSON). Check API routes.");
      }

      setBooks(Array.isArray(booksData) ? booksData : []);
      setStats(statsData);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "A connection error occurred.";
      setError(errorMessage);
      console.error("Dashboard Fetch Error:", err);
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
          <div className="animate-spin h-10 w-10 border-4 border-sky-700 border-t-transparent rounded-full"></div>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">Verifying Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
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

      {/* Stats Overview: Live on Store, Inventory (Drafts), Revenue */}
      <div className="max-w-7xl mx-auto">
        <StatsOverview 
          draftCount={stats?.totalDrafts || 0} 
          liveCount={stats?.liveStoreCount || 0}
          revenue={stats?.dailyRevenue || 0}
          conversion={stats?.conversionRate || 0}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Books Management List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <BookTabs active={status} onChange={setStatus} />
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
            ) : books.length === 0 ? (
              <EmptyState text={`No ${status} books found in the database.`} />
            ) : (
              <div className="grid gap-4">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} />
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