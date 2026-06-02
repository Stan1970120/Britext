'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, ArrowLeft, Calendar, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { REST_API } from "../../../constant";
import { useAuth } from "@/app/context/AuthContext";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  views: number;
  createdAt: string;
}

export default function PublishedBlogs() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI interaction states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parse relative or absolute asset locations
  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/600x400?text=No+Cover";
    if (path.startsWith("http")) return path;
    const baseUrl = REST_API.replace("/api", "");
    return `${baseUrl}/${path.startsWith("/") ? path.slice(1) : path}`;
  };

  const fetchPublishedBlogs = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${REST_API}/blogs/admin/published`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please re-authenticate.");
        throw new Error("Failed to load records from database.");
      }

      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.replace("/signin");
      } else {
        fetchPublishedBlogs();
      }
    }
  }, [fetchPublishedBlogs, authLoading, token, router]);

  const handleDeleteBlog = async () => {
    if (!token || !confirmDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${REST_API}/blogs/admin/published/${confirmDeleteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setBlogs((prev) => prev.filter((blog) => blog._id !== confirmDeleteId));
        setConfirmDeleteId(null);
        setToastMessage("Article removed successfully");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert("Failed to delete the article. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="animate-spin text-sky-600" size={40} />
        <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">
          Loading Published Content...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 text-gray-900 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border border-slate-700 text-sm">
            <div className="bg-emerald-500 p-1 rounded-full">
              <CheckCircle size={16} className="text-white" />
            </div>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center text-red-600 mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Article?</h3>
            <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
              This action is permanent. The story file layout and analytics telemetry will be deleted completely.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
              >
                Keep Article
              </button>
              <button
                onClick={handleDeleteBlog}
                disabled={isDeleting}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-sky-600 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Published Blogs</h1>
          <p className="text-slate-500 text-sm font-medium">Review engagement telemetry or remove articles from production routing.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {error ? (
          <div className="p-10 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-center max-w-xl mx-auto">
            <p className="font-bold mb-2">Sync Error</p>
            <p className="text-sm mb-6">{error}</p>
            <button
              onClick={fetchPublishedBlogs}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-sm">
            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">No Content Available</p>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">There are no published articles currently indexed inside the production repository.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Aspect-Cover Canvas */}
                  <div className="relative w-full h-48 bg-slate-100">
                    <Image
                      src={getImageUrl(blog.coverImage)}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(blog.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {blog.views.toLocaleString()} views
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-slate-50 flex justify-end">
                  <button
                    onClick={() => setConfirmDeleteId(blog._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-100 bg-red-50/50 text-red-600 font-bold text-xs hover:bg-red-600 hover:text-white transition-all duration-200"
                  >
                    <Trash2 size={14} />
                    Delete Article
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}