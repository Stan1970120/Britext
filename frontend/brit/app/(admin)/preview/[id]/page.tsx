"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Book } from "../../../types/books";
import { API } from "../../../constant/api";
import Link from "next/link";

export default function BookPreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchBookPreview = async () => {
      try {
        const res = await fetch(API.GET_BOOK(id as string), {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setBook(data);
        }
      } catch (error) {
        console.error("Failed to load preview", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookPreview();
  }, [id]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(API.PUBLISH_BOOK(id as string), {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/books"); // Return to dashboard after publishing
      }
    } catch (error) {
      alert("Error publishing book");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Preview...</div>;
  if (!book) return <div className="p-10 text-center">Book not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Admin Action Bar */}
      <div className="flex justify-between items-center mb-8 bg-gray-900 text-white p-4 rounded-lg shadow-lg">
        <div>
          <span className="text-xs uppercase tracking-widest text-gray-400">Preview Mode</span>
          <h2 className="font-bold">Viewing: {book.title}</h2>
        </div>
        <div className="flex gap-3">
          <Link href="/books" className="px-4 py-2 text-sm hover:text-gray-300">
            Exit Preview
          </Link>
          <button
            onClick={handlePublish}
            disabled={publishing || book.status === "published"}
            className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded font-bold transition-colors disabled:bg-gray-600"
          >
            {publishing ? "Publishing..." : book.status === "published" ? "Already Published" : "Confirm & Publish"}
          </button>
        </div>
      </div>

      {/* Public Storefront Mockup */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Cover Column */}
        <div className="md:w-1/3 bg-gray-50 p-8 flex justify-center border-r">
          <div className="w-64 h-96 shadow-2xl relative group">
            <img
              src={book.coverImage || "/placeholder-cover.jpg"}
              alt={book.title}
              className="w-full h-full object-cover rounded-sm"
            />
          </div>
        </div>

        {/* Content Column */}
        <div className="md:w-2/3 p-8 md:p-12 space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900">{book.title}</h1>
            <p className="text-xl text-gray-600 mt-2">by Admin Author</p>
          </div>

          <div className="flex gap-4 border-y py-4">
            <div className="text-center px-4 border-r">
              <p className="text-xs text-gray-500 uppercase">Format</p>
              <p className="font-bold">E-Book</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-gray-500 uppercase">Status</p>
              <p className={`font-bold ${book.status === 'published' ? 'text-green-600' : 'text-orange-600'}`}>
                {book.status.toUpperCase()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2 text-gray-800">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>

          <div className="pt-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Chapters</h3>
            <div className="space-y-2">
              {/* If you have chapters data, map it here */}
              <div className="p-3 bg-gray-50 rounded border text-gray-500 italic">
                Sample chapter content would appear here for readers...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}