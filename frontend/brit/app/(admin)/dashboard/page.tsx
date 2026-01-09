"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// Type Imports
import { DashboardStats, Transaction } from "@/app/types/analytics";
import { Book } from "@/app/types/books";

// Constant Imports
import { API } from "@/app/constant/api";

// Component Imports
import BookTabs from "./components/BookTabs";
import BookCard from "./components/BookCard";
import EmptyState from "./components/EmptyState";
import StatsOverview from "./components/StatsOverview";

export default function AdminDashboard() {
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [booksRes, statsRes] = await Promise.all([
        fetch(API.ADMIN_BOOKS(status), { credentials: "include" }),
        fetch(API.GET_ADMIN_STATS, { credentials: "include" })
      ]);

      if (booksRes.status === 401 || statsRes.status === 401) {
        setError("Unauthorized: Please log in as Admin.");
        return;
      }

      const booksData = await booksRes.json();
      const statsData = await statsRes.json();

      if (Array.isArray(booksData)) setBooks(booksData);
      if (statsData) setStats(statsData);

    } catch (err) {
      setError("Connection failed. Check your backend status.");
      console.error("Integration Error:", err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900">
      
      {/* SECTION 1: Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage manuscripts and monitor global store sales.</p>
        </div>
        <Link href="/create" className="bg-[#035b77] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#024a61] transition-all">
          + New Manuscript
        </Link>
      </div>

      {/* SECTION 2: E-commerce Analytics Cards */}
      <div className="max-w-7xl mx-auto">
        <StatsOverview 
          draftCount={stats?.totalDrafts || 0} 
          liveCount={stats?.liveStoreCount || 0}
          revenue={stats?.dailyRevenue || 0}
          conversion={stats?.conversionRate || 0}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION 3: Book Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <BookTabs active={status} onChange={setStatus} />
            </div>

            {error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm italic">
                {error}
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

        {/* SECTION 4: Real Transaction History */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No recent sales data.</p>
            ) : (
              stats.recentTransactions.map((tx: Transaction) => (
                <div key={tx._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <div>
                    <p className="font-medium text-gray-800">{tx.bookTitle}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">+${tx.amount.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}