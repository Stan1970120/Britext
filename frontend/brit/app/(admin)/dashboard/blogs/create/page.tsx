// frontend/brit/app/(admin)/dashboard/blogs/create/page.tsx

'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, Eye, Edit2, Globe, Link2, Trash2, 
  UploadCloud, Send, Loader2, CheckCircle2, AlertCircle, FileText 
} from "lucide-react";
import { REST_API } from "../../../../constant";
import { useAuth } from "@/app/context/AuthContext";

interface BlogPayload {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  liveUrl?: string;
  slug?: string;
}

export default function CreateAndManageBlogs() {
  const router = useRouter();
  const { token } = useAuth();

  // Mode states
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [existingBlogs, setExistingBlogs] = useState<BlogPayload[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Core Form State
  const [formData, setFormData] = useState<BlogPayload>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "Trending",
    liveUrl: ""
  });

  // Fetch blogs for deletion management grid
  useEffect(() => {
    if (!token) return;
    const fetchBlogs = async () => {
      try {
        setIsLoadingBlogs(true);
        const res = await fetch(`${REST_API}/blogs/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setExistingBlogs(data);
        }
      } catch (err) {
        console.error("Error retrieving existing blogs:", err);
      } finally {
        setIsLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, [token]);

  // Handle image upload to AWS S3 via backend presigned/direct routing
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch(`${REST_API}/blogs/admin/upload-s3`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm
      });

      if (!res.ok) throw new Error("S3 Upload Failed");
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, coverImage: data.url }));
      showToast("success", "Cover image securely hosted on S3!");
    } catch (err) {
      showToast("error", "Failed uploading image to S3 storage.");
    } finally {
      setIsUploading(false);
    }
  };

  // Create or Publish Blog Handler
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast("error", "Title and content spaces are mandatory.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${REST_API}/blogs/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Publishing structural validation failed.");

      showToast("success", "Blog engine updated! Returning to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      showToast("error", "Error deploying article to database ecosystem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Blog Implementation
  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Are you certain you want to purge this record permanently?")) return;

    try {
      const res = await fetch(`${REST_API}/blogs/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();
      setExistingBlogs(prev => prev.filter(b => b._id !== id));
      showToast("success", "Article dropped successfully.");
    } catch (err) {
      showToast("error", "Could not remove targeted record.");
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 relative">
      
      {/* Dynamic Status Notifications */}
      {statusMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-3 font-bold text-sm ${
            statusMessage.type === "success" 
              ? "bg-slate-900 text-white border-slate-800" 
              : "bg-red-50 text-red-600 border-red-100"
          }`}>
            {statusMessage.type === "success" ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} />}
            {statusMessage.text}
          </div>
        </div>
      )}

      {/* Control Action Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={() => router.push("/dashboard")}
          className="group text-slate-500 hover:text-slate-900 font-bold text-sm flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {viewMode === "edit" ? (
              <>
                <Eye size={16} className="text-slate-400" /> Preview Browser Mode
              </>
            ) : (
              <>
                <Edit2 size={16} className="text-slate-400" /> Back to Editor Workspace
              </>
            )}
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Publish Content
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Workspace Column */}
        <div className={`${viewMode === "edit" ? "lg:col-span-7" : "hidden"} space-y-6`}>
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Compose Article</h2>
              <p className="text-slate-400 text-xs font-medium">Build rich dynamic search headlines targeting standard indexing parameters.</p>
            </div>

            <form className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Headline Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 10 Books That Will Change Your Perspective on Open Source Systems"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Ecosystem Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm bg-white"
                  >
                    <option value="Trending">Trending</option>
                    <option value="Reviews">Book Reviews</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Authors">Author Insights</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <Link2 size={12} /> Target Redirect URL <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input 
                    type="url"
                    placeholder="https://enjoyreads.com/book-store/..."
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({...formData, liveUrl: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Brief Excerpt</label>
                <textarea 
                  rows={2}
                  maxLength={160}
                  placeholder="A short punchy summary snippet engineered for organic search visibility limits..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm resize-none"
                />
              </div>

              {/* AWS S3 Document Management Box */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Cover Asset (S3 Storage)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50/50 transition relative group">
                  {formData.coverImage ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                        <Image src={formData.coverImage} fill className="object-cover" alt="S3 Asset Target" unoptimized />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, coverImage: ""})}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remove and replace asset
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <div className="mx-auto w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 group-hover:scale-110 transition">
                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={20} />}
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-sky-600">Click to upload</span> image asset directly into Amazon S3
                      </div>
                      <p className="text-[10px] text-slate-400">PNG, JPG or WebP accepted standard format assets</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Main Content Body</label>
                <textarea 
                  rows={8}
                  placeholder="Write or paste your full complete markdown or standard article structure content body here..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-sans"
                />
              </div>
            </form>
          </div>

          {/* Active Maintenance Purging Section */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Manage Published Feed</h3>
              <p className="text-slate-400 text-xs">Purge or review live system index parameters instantly.</p>
            </div>

            {isLoadingBlogs ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
                <Loader2 size={14} className="animate-spin" /> Syncing index...
              </div>
            ) : existingBlogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No historical entries deployed.</p>
            ) : (
              <div className="divide-y divide-slate-100 border rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                {existingBlogs.map((blog) => (
                  <div key={blog._id} className="flex justify-between items-center p-3 bg-white hover:bg-slate-50 transition">
                    <div className="truncate max-w-[80%] pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{blog.title}</p>
                      <p className="text-[10px] font-medium text-slate-400">{blog.category} • {blog.slug || "No-slug"}</p>
                    </div>
                    <button
                      onClick={() => blog._id && handleDeleteBlog(blog._id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Purge Document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Search Browser Engine Mockup View */}
        <div className={`${viewMode === "preview" ? "lg:col-span-12" : "lg:col-span-5"} flex justify-center items-start`}>
          <div className="w-full max-w-sm sticky top-8">
            <div className="text-center mb-2">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Live Engine Simulation</span>
            </div>
            
            {/* Mobile View Container Block */}
            <div className="w-full border-[6px] border-slate-900 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[560px] flex flex-col relative">
              {/* Device Status System Bar */}
              <div className="bg-slate-900 text-white px-6 py-2 flex justify-between items-center text-[10px] font-bold">
                <span>9:41</span>
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-1.5"></div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-white rounded-full inline-block scale-75"></span>
                  <span className="text-[8px]">enjoyreads.com</span>
                </div>
              </div>

              {/* Simulation Engine Content Header Bar */}
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <div className="w-full bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] text-slate-500 flex items-center gap-2 shadow-sm">
                  <Globe size={11} className="text-slate-400" />
                  <span className="truncate">https://enjoyreads.com/blog/{formData.title ? "slug-preview" : ""}</span>
                </div>
              </div>

              {/* Main Headline Body Simulation */}
              <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 space-y-3 hover:border-slate-300 transition duration-200">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 bg-sky-500 rounded-full"></span>
                        <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">{formData.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-3">
                        {formData.title || "Headline title displays dynamically as you type in workspace..."}
                      </h4>
                    </div>
                    <div className="relative w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                      {formData.coverImage ? (
                        <Image src={formData.coverImage} fill className="object-cover" alt="S3 Asset Preview" unoptimized />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <FileText size={18} />
                          <span className="text-[8px] font-bold mt-1">NO COVER</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                    {formData.excerpt || "Brief excerpt engineered summary data shows up here as structural search headlines placeholder info."}
                  </p>

                  {/* Active Redirect Live Link Verification UI */}
                  {formData.liveUrl && (
                    <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                      <a 
                        href={formData.liveUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-sky-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[85%]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link2 size={10} />
                        Visit Target Link
                      </a>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">Redirect Active</span>
                    </div>
                  )}
                </div>

                {/* Simulated Content Body Preview Section */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase border-b pb-1">Article Body Content View</span>
                  <div className="text-xs text-slate-700 space-y-2 leading-relaxed whitespace-pre-wrap">
                    {formData.content || "Full length content layout displays here below the browser headline block context."}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}