"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "../../constant/api";
import Link from "next/link";
import { Plus, Trash2, BookOpen, Type, Hash } from "lucide-react";

interface Chapter {
  title: string;    // e.g., "Chapter 1"
  heading: string;  // e.g., "The Beginning of the End"
  content: string;
}

export default function CreateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [chapters, setChapters] = useState<Chapter[]>([
    { title: "Chapter 1", heading: "", content: "" }
  ]);

  // ✨ NEW: Helper to estimate pages (roughly 250 words per page)
  const calculateTotalPages = () => {
    const totalWords = chapters.reduce((acc, ch) => acc + ch.content.split(/\s+/).filter(Boolean).length, 0);
    return Math.max(1, Math.ceil(totalWords / 250));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
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

    // Add estimated pages to form data for the DB
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
        router.push("/books");
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
          <p className="text-gray-500">Structure your book with headings and content.</p>
        </div>
        
        {/* ✨ NEW: Stats Badge */}
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
            <BookOpen size={20}/> Basic Information
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2">Book Title</label>
            <input name="title" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none" placeholder="e.g. The Path to Greatness" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description / Blurb</label>
            <textarea name="description" required rows={3} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none" placeholder="What is this book about?" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Book Cover Image</label>
            <div className="flex items-center gap-4">
              <input type="file" name="cover" accept="image/*" required onChange={handleImageChange} className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#035b77] file:text-white" />
              {preview && <div className="w-16 h-24 border rounded overflow-hidden shadow-sm"><img src={preview} alt="Preview" className="object-cover w-full h-full" /></div>}
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#035b77]">Chapters</h2>
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
                {/* Chapter Title & Heading */}
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chapter Number/Title</label>
                    <input
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, "title", e.target.value)}
                      className="bg-transparent text-lg font-bold outline-none border-b border-gray-300 focus:border-[#035b77] pb-1 w-full"
                      placeholder="e.g. Chapter 1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chapter Heading</label>
                    <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-[#035b77]">
                      <Type size={16} className="text-gray-400" />
                      <input
                        value={chapter.heading}
                        onChange={(e) => updateChapter(index, "heading", e.target.value)}
                        className="bg-transparent text-lg font-medium outline-none py-1 w-full"
                        placeholder="e.g. The Beginning of a New Era"
                      />
                    </div>
                  </div>
                </div>

                {/* Chapter Content */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content</label>
                  <textarea
                    value={chapter.content}
                    onChange={(e) => updateChapter(index, "content", e.target.value)}
                    rows={8}
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-[#035b77] outline-none bg-white mt-1 shadow-inner text-gray-700 leading-relaxed"
                    placeholder="Start writing the story..."
                  />
                  <p className="text-[10px] text-right text-gray-400 mt-1 italic">
                    Estimated: {Math.max(1, Math.ceil(chapter.content.split(/\s+/).filter(Boolean).length / 250))} pages for this chapter.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#035b77] text-white py-4 rounded-lg font-bold hover:bg-[#024a61] shadow-lg sticky bottom-6 z-30"
        >
          {loading ? "Saving to Cloud..." : "Save Book and Chapters"}
        </button>
      </form>
    </div>
  );
}