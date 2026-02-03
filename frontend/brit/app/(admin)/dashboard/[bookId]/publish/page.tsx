"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/app/constant/api";
import { useAuth } from "@/app/context/AuthContext";
import { FiCheckCircle, FiLoader } from "react-icons/fi";

const categories = [
  "Educational",
  "Fiction",
  "Non-Fiction",
  "Professional & Technical",
  "Faith Based",
  "Lifestyle",
  "Journal & Notes",
];

export default function PublishPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    author: "",
    category: "Educational",
    price: "",
    summary: "",
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API.PUBLISH_BOOK(id as string), {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          status: "published",
          price: Number(formData.price), // Ensure it's a number for the DB
        }),
      });

      if (res.ok) {
        setShowSuccess(true);
        // Wait 2 seconds so they see the success message, then redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to publish book.");
      }
    } catch (error) {
      alert("Connectivity issue. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50/30 py-12 px-4">
      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
            <FiCheckCircle className="text-6xl text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Book Published!</h2>
            <p className="text-gray-500 mt-2">Your manuscript is now live on the storefront. Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Publishing Portal</h1>
        <p className="text-gray-500 mb-8">Complete the storefront details to make this book live.</p>

        <form onSubmit={handlePublish} className="space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Display Author</label>
              <input
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="e.g. Stephen Wildish"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="e.g. 19.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Storefront Summary</label>
            <textarea
              required
              rows={5}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              placeholder="Write a compelling blurb for your readers..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading || showSuccess}
            className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold hover:bg-sky-600 active:scale-[0.98] transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Syncing with Store...
              </>
            ) : (
              "Confirm & Go Live 🚀"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}