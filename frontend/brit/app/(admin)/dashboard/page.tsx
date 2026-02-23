"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "../../constant/api";
import Link from "next/link";
import { Plus, Trash2, BookOpen, Type, Hash, FileText, UploadCloud } from "lucide-react";

interface Chapter {
  title: string;
  heading: string;
  content: string;
}

export default function CreateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [manuscriptName, setManuscriptName] = useState<string | null>(null);
  
  const [chapters, setChapters] = useState<Chapter[]>([
    { title: "Chapter 1", heading: "", content: "" }
  ]);

  const calculateTotalPages = () => {
    const totalWords = chapters.reduce((acc, ch) => acc + ch.content.split(/\s+/).filter(Boolean).length, 0);
    return Math.max(1, Math.ceil(totalWords / 250));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setManuscriptName(file.name);
  };

  const addChapter = () => {
    setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, heading: "", content: "" }]);
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const updateChapter = (index: number, field: keyof Chapter, value: string) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("token");

    // Add metadata for the database
    formData.append("estimatedPages", calculateTotalPages().toString());
    formData.append("chapters", JSON.stringify(chapters));

    try {
      const res = await fetch(API.CREATE_BOOK, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        // ✅ Redirecting to Admin Dashboard instead of /books
        router.push("/dashboard"); 
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link href="/dashboard" className="text-sm text-[#035b77] hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-4 text-[#035b77]">Create New Book</h1>
          <p className="text-gray-500">Upload your cover and manuscript to AWS S3.</p>
        </div>
        
        <div className="bg-sky-50 border border-sky-100 p-3 rounded-lg text-right">
          <p className="text-xs text-sky-600 font-bold uppercase tracking-wider">Estimated Length</p>
          <p className="text-xl font-black text-[#035b77] flex items-center justify-end gap-1">
            <Hash size={18} /> {calculateTotalPages()} Pages
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-8 border rounded-xl shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <BookOpen size={20}/> Book Assets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Book Title</label>
              <input name="title" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select name="category" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none bg-white">
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Educational">Educational</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea name="description" required rows={3} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Cover Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Book Cover (Public)</label>
              <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition relative">
                <input type="file" name="cover" accept="image/*" required onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {preview ? (
                  <img src={preview} alt="Preview" className="w-12 h-16 object-cover rounded shadow-md" />
                ) : (
                  <UploadCloud className="text-gray-400" size={24} />
                )}
                <span className="text-sm text-gray-500 font-medium">{preview ? "Change Cover" : "Upload Image"}</span>
              </div>
            </div>

            {/* Manuscript Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Full Manuscript (Private PDF)</label>
              <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition relative">
                <input type="file" name="manuscript" accept=".pdf,.epub" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <FileText className={manuscriptName ? "text-green-500" : "text-gray-400"} size={24} />
                <span className="text-sm text-gray-500 font-medium truncate max-w-[150px]">
                  {manuscriptName || "Upload PDF/EPUB"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#035b77]">Online Reader Content</h2>
            <button type="button" onClick={addChapter} className="flex items-center gap-2 bg-[#035b77] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#024a61] transition">
              <Plus size={16} /> Add Chapter
            </button>
          </div>

          {chapters.map((chapter, index) => (
            <div key={index} className="bg-gray-50 p-6 border rounded-xl relative border-l-4 border-l-[#035b77]">
              <button type="button" onClick={() => removeChapter(index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                <Trash2 size={18} />
              </button>
              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chapter Title</label>
                    <input
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, "title", e.target.value)}
                      className="bg-transparent text-lg font-bold outline-none border-b border-gray-300 focus:border-[#035b77] pb-1 w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Heading</label>
                    <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-[#035b77]">
                      <Type size={16} className="text-gray-400" />
                      <input
                        value={chapter.heading}
                        onChange={(e) => updateChapter(index, "heading", e.target.value)}
                        className="bg-transparent text-lg font-medium outline-none py-1 w-full"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <textarea
                    value={chapter.content}
                    onChange={(e) => updateChapter(index, "content", e.target.value)}
                    rows={6}
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none bg-white mt-1 shadow-inner"
                    placeholder="Enter chapter text here..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#035b77] text-white py-4 rounded-lg font-bold hover:bg-[#024a61] shadow-lg sticky bottom-6 z-30 flex items-center justify-center gap-3 transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Uploading to AWS S3...
            </>
          ) : (
            "Publish to EnjoyReads"
          )}
        </button>
      </form>
    </div>
  );
}