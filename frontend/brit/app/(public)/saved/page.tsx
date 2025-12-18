"use client";

import React from "react";
import { Bookmark, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NoSavedItemsPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-16">
      {/* Icon */}
      <div className="bg-[#e6f3f7] p-6 rounded-full mb-6">
        <Bookmark size={48} className="text-[#035b77]" />
      </div>

      {/* Text */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        No Saved Items
      </h1>
      <p className="text-gray-500 text-center max-w-sm mb-8">
        You haven’t saved any items yet. When you do, they’ll appear here.  
        Check back later or start exploring to find something you like.
      </p>

      {/* Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-[#035b77] text-white px-5 py-3 rounded-full font-semibold hover:bg-[#02485d] transition"
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );
};

export default NoSavedItemsPage;