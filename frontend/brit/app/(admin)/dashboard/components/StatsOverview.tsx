"use client";

import { FiBookOpen, FiDollarSign, FiActivity, FiLayers } from "react-icons/fi";

interface StatsOverviewProps {
  draftCount: number;
  liveCount: number;
  revenue: number;
  conversion: number;
}

export default function StatsOverview({ 
  draftCount, 
  liveCount, 
  revenue, 
  conversion 
}: StatsOverviewProps) {
  
  const stats = [
    {
      label: "Inventory (Drafts)",
      value: draftCount || 0,
      icon: <FiLayers className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Live on Store",
      value: liveCount || 0,
      icon: <FiBookOpen className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Daily Revenue",
      // ✨ Casting to Number to prevent .toFixed is not a function error
      value: `$${Number(revenue || 0).toFixed(2)}`,
      icon: <FiDollarSign className="text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      label: "Store Conversion",
      // ✨ Casting to Number to prevent .toFixed is not a function error
      value: `${Number(conversion || 0).toFixed(1)}%`,
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}