// components/admin/Topbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Books", href: "/books" },
  { label: "Upload Book", href: "/books/upload" },
  { label: "Orders", href: "/orders" },
  { label: "Analytics", href: "/analytics" },
];

export default function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold">Admin Panel</h1>

        <div className="flex items-center gap-3">
          <button className="text-xl">🔔</button>
          <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm">
            A
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setOpen(false)}
        />

        {/* Sidebar */}
        <div className="relative w-64 h-full bg-sky-900 text-white p-6 flex flex-col">
          <button
            onClick={() => setOpen(false)}
            className="text-white mb-6 text-2xl self-end"
          >
            ✕
          </button>

          <nav className="flex flex-col gap-3 mt-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded hover:bg-slate-800 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
