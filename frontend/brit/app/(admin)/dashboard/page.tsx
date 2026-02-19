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
  
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeJsonResponse = async <T,>(response: Response): Promise<T | null> => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    }
    const errorText = await response.text();
    console.error("Backend returned non-JSON response:", errorText.substring(0, 200));
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
        fetch(API.ADMIN_BOOKS(status), { method: "GET", headers, credentials: "include" }),
        fetch(API.GET_ADMIN_STATS, { method: "GET", headers, credentials: "include" })
      ]);

      if (statsRes.status === 404) {
        setError("Admin Stats endpoint not found (404). Please check backend route configuration.");
        setLoading(false);
        return;
      }

      if (booksRes.status === 401 || statsRes.status === 401) {
        setError("Session unauthorized. Please log in as an administrator.");
        return;
      }

      const booksData = await safeJsonResponse<Book[]>(booksRes);
      const statsData = await safeJsonResponse<DashboardStats>(statsRes);

      if (!booksData || !statsData) {
        throw new Error("The server returned an invalid response format (HTML instead of JSON).");
      }

      setBooks(Array.isArray(booksData) ? booksData : []);
      setStats(statsData);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected connection error occurred.";
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
          <div className="animate-spin h-10 w-10 border-4 border-[#035b77] border-t-transparent rounded-full"></div>
          <p className="text-gray-500 font-medium">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage manuscripts and monitor global store sales.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
          >
            Logout
          </button>
          <Link href="/create" className="bg-[#035b77] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#024a61] transition-all">
            + New Manuscript
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <BookTabs active={status} onChange={setStatus} />
            </div>

            {error ? (
              <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 flex flex-col items-center text-center">
                <p className="font-semibold mb-2">Sync Error</p>
                <p className="text-sm italic mb-4">{error}</p>
                <button 
                  onClick={() => fetchDashboardData()}
                  className="text-xs bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[#035b77] border-t-transparent rounded-full"></div>
              </div>
            ) : books.length === 0 ? (
              <EmptyState text={`No ${status} books found.`} />
            ) : (
              <div className="grid gap-4">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transactions Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No recent sales data.</p>
            ) : (
              stats.recentTransactions.map((tx: Transaction) => (
                <div key={tx._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <div className="max-w-[150px]">
                    <p className="font-medium text-gray-800 truncate">{tx.bookTitle}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {/* ✨ FIX: Added Number() casting here to prevent crashes */}
                  <p className="font-bold text-green-600">+${Number(tx.amount || 0).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}