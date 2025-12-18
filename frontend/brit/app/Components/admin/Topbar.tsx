// components/admin/Topbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
        {/* Mobile menu */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-xl"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold">Admin Panel</h1>

        <div className="flex items-center gap-3">
          <button>🔔</button>
          <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm">
            A
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="w-64 bg-slate-900 h-full p-6">
            <button
              onClick={() => setOpen(false)}
              className="text-white mb-6"
            >
              ✕
            </button>

            <nav className="space-y-3">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/books">Books</Link>
              <Link href="/books/upload">Upload Book</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/analytics">Analytics</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
