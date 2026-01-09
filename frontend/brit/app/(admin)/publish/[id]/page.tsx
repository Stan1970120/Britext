"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/app/constant/api";

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
  const [loading, setLoading] = useState(false);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: "published", // This flips the switch to live
          price: Number(formData.price),
        }),
        credentials: "include",
      });

      if (res.ok) {
        router.push("/books"); // Back to dashboard
      }
    } catch (error) {
      alert("Failed to move book to storefront.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Publishing Portal</h1>
      <p className="text-gray-500 mb-8">Complete the storefront details to make this book live.</p>

      <form onSubmit={handlePublish} className="space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Display Author</label>
            <input
              required
              className="w-full p-3 border rounded-xl"
              placeholder="e.g. Stephen Wildish"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Price ($)</label>
            <input
              required
              type="number"
              className="w-full p-3 border rounded-xl"
              placeholder="e.g. 400"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Category</label>
          <select
            className="w-full p-3 border rounded-xl bg-white"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Storefront Summary</label>
          <textarea
            required
            rows={4}
            className="w-full p-3 border rounded-xl"
            placeholder="A compelling summary for your readers..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100"
        >
          {loading ? "Syncing with Store..." : "Confirm & Go Live 🚀"}
        </button>
      </form>
    </div>
  );
}