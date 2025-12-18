// components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Books", href: "/books" },
  { label: "Upload Book", href: "/books/upload" },
  { label: "Orders", href: "/orders" },
  { label: "Analytics", href: "/analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 bg-sky-900 text-white flex-col">
      <div className="p-6 text-xl font-semibold">BASE Admin</div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded-lg text-sm ${
                active
                  ? "bg-slate-700"
                  : "hover:bg-slate-800 text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
