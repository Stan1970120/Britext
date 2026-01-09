"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "../../constant/api";
import Link from "next/link";

export default function CreateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Handle Image Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(API.CREATE_BOOK, {
        method: "POST",
        body: formData, // Sending as FormData for file support
        credentials: "include",
      });

      if (res.ok) {
        router.push("/books"); // Redirect back to dashboard
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Failed to create book"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/books" className="text-sm text-[#035b77] hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">Create New Book</h1>
        <p className="text-gray-500">Enter your book details and upload a cover image.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border rounded-xl shadow-sm">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Book Title</label>
          <input
            name="title"
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none"
            placeholder="e.g. The Great Gatsby"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description / Blurb</label>
          <textarea
            name="description"
            required
            rows={4}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none"
            placeholder="What is this book about?"
          />
        </div>

        {/* Cover Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Book Cover Image</label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                type="file"
                name="cover"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#035b77] file:text-white hover:file:bg-[#024a61]"
              />
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, or WebP. Recommended ratio 2:3</p>
            </div>
            
            {preview && (
              <div className="w-24 h-36 border rounded overflow-hidden relative bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#035b77] text-white py-4 rounded-lg font-bold hover:bg-[#024a61] disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating Book..." : "Save as Draft"}
        </button>
      </form>
    </div>
  );
}