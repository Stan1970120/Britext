"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "../../constant/api";
import Link from "next/link";
import { Plus, Trash2, BookOpen, Type, Hash, Image as ImageIcon } from "lucide-react";

interface Chapter {
  title: string;
  heading: string;
  content: string;
}

export default function CreateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
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

  const addChapter = () => {
    setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, heading: "", content: "" }]);
  };

  const removeChapter = (index: number) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter((_, i) => i !== index));
    }
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

    // Remove manuscript if it exists in form, we only want the cover
    formData.delete("manuscript"); 
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
        router.push("/dashboard"); // Or wherever your drafts live
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Failed to save book"}`);
      }
    } catch (error) {
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link href="/dashboard" className="text-sm text-[#035b77] hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-2 text-[#035b77]">Draft Your Book</h1>
          <p className="text-gray-500">Focus on the writing. You can set the category when you&apos;re ready to publish.</p>
        </div>
        
        <div className="bg-sky-50 border border-sky-100 p-3 rounded-lg text-right hidden sm:block">
          <p className="text-xs text-sky-600 font-bold uppercase tracking-wider">Word Count Progress</p>
          <p className="text-xl font-black text-[#035b77] flex items-center justify-end gap-1">
            <Hash size={18} /> {calculateTotalPages()} Pages
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Book Metadata */}
        <div className="bg-white p-6 border rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Book Title</label>
              <input name="title" required className="w-full p-3 border rounded-lg outline-none focus:border-[#035b77]" placeholder="The Silent Forest..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Synopsis</label>
              <textarea name="description" required rows={4} className="w-full p-3 border rounded-lg outline-none focus:border-[#035b77]" placeholder="Summarize your story..." />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 bg-gray-50">
             <label className="cursor-pointer text-center">
                {preview ? (
                   <img src={preview} alt="Cover" className="w-32 h-48 object-cover rounded shadow-md mb-2" />
                ) : (
                   <div className="w-32 h-48 bg-gray-200 rounded flex flex-col items-center justify-center text-gray-400 mb-2">
                      <ImageIcon size={32} />
                      <span className="text-xs mt-2">Upload Cover</span>
                   </div>
                )}
                <input type="file" name="cover" accept="image/*" required onChange={handleImageChange} className="hidden" />
                <span className="text-[10px] text-gray-500 font-medium">Click to change cover image</span>
             </label>
          </div>
        </div>

        {/* Writing Area */}
        <div className="space-y-6">
          <div className="flex justify-between items-center sticky top-0 bg-gray-50/80 backdrop-blur py-4 z-20 px-2">
            <h2 className="text-xl font-bold text-[#035b77]">Chapters</h2>
            <button type="button" onClick={addChapter} className="flex items-center gap-2 bg-[#035b77] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#024a61]">
              <Plus size={16} /> New Chapter
            </button>
          </div>

          {chapters.map((chapter, index) => (
            <div key={index} className="bg-white p-6 border rounded-xl relative shadow-sm hover:shadow-md transition-shadow">
              <button 
                type="button" 
                onClick={() => removeChapter(index)} 
                className={`absolute top-4 right-4 text-gray-300 hover:text-red-500 ${chapters.length === 1 ? 'hidden' : ''}`}
              >
                <Trash2 size={18} />
              </button>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    value={chapter.title}
                    onChange={(e) => updateChapter(index, "title", e.target.value)}
                    className="text-xl font-bold text-[#035b77] outline-none border-b-2 border-transparent focus:border-sky-200 w-full sm:w-1/4"
                    placeholder="Chapter 1"
                  />
                  <input
                    value={chapter.heading}
                    onChange={(e) => updateChapter(index, "heading", e.target.value)}
                    className="text-lg font-medium outline-none border-b-2 border-transparent focus:border-sky-200 flex-1"
                    placeholder="Add a subtitle/heading..."
                  />
                </div>

                <textarea
                  value={chapter.content}
                  onChange={(e) => updateChapter(index, "content", e.target.value)}
                  rows={12}
                  className="w-full p-4 border-none bg-slate-50 rounded-lg outline-none text-gray-700 leading-relaxed font-serif text-lg"
                  placeholder="Once upon a time..."
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#035b77] text-white py-4 rounded-xl font-bold hover:bg-[#024a61] shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Saving Draft..." : "Save All Progress"}
        </button>
      </form>
    </div>
  );
}