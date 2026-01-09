"use client";

import { Book } from "@/app/types/books";
import { FiBookOpen, FiDollarSign, FiActivity, FiLayers } from "react-icons/fi";

export default function StatsOverview({ books }: { books: Book[] }) {
  const publishedCount = books.filter((b) => b.status === "published").length;
  const draftCount = books.filter((b) => b.status === "draft").length;

  const stats = [
    {
      label: "Inventory (Drafts)",
      value: draftCount,
      icon: <FiLayers className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Live on Store",
      value: publishedCount,
      icon: <FiBookOpen className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Daily Revenue",
      value: "$0.00", // This would eventually fetch from a /transactions endpoint
      icon: <FiDollarSign className="text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      label: "Store Conversion",
      value: "0.0%",
      icon: <FiActivity className="text-purple-600" />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${stat.bg} text-xl`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}