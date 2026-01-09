"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Book } from "@/app/types/books";
import { API } from "@/app/constant/api";
import BookTabs from "./components/BookTabs";
import BookCard from "./components/BookCard";
import EmptyState from "./components/EmptyState";
import StatsOverview from "./components/StatsOverview";

export default function AdminDashboard() {
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Unified Fetch Logic
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(API.ADMIN_BOOKS(status), {
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Unauthorized: Please log in as Admin.");
        return;
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      setError("Connection failed. Check your backend status.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      
      {/* SECTION 1: Header & Quick Actions */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500">Manage manuscripts, monitor sales, and publish to the global store.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/create" className="bg-[#035b77] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#024a61] transition-all">
            + New Manuscript
          </Link>
        </div>
      </div>

      {/* SECTION 2: E-commerce Analytics Cards */}
      <div className="max-w-7xl mx-auto">
        <StatsOverview books={books} />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION 3: Book Management (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <BookTabs active={status} onChange={setStatus} />
              <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                MODE: {status === 'draft' ? 'EDIT/PREVIEW' : 'LIVE STORE'}
              </div>
            </div>

            {error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm italic">
                {error}
              </div>
            ) : loading ? (
              <div className="py-20 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#035b77] border-t-transparent rounded-full"></div></div>
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

        {/* SECTION 4: Recent Activity & Transactions (Right 1 Column) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <div>
                    <p className="font-medium text-gray-800">Order #120{i}</p>
                    <p className="text-xs text-gray-400">2 mins ago</p>
                  </div>
                  <p className="font-bold text-green-600">+$14.99</p>
                </div>
              ))}
              <button className="w-full py-2 text-xs font-bold text-[#035b77] hover:bg-gray-50 rounded-lg">View All Transactions</button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#035b77] to-[#024a61] p-6 rounded-2xl text-white shadow-xl">
            <h3 className="font-bold mb-1">Store Tip</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Books with professional cover images see 40% higher conversion rates. Use the 2:3 aspect ratio for best results.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}