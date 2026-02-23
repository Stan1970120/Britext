"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REST_API } from "../../constant"; // Use REST_API consistently
import Link from "next/link";
import { Plus, Trash2, Hash, Image as ImageIcon, Loader2, Save, BookOpen } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface Chapter {
  title: string;
  heading: string;
  content: string;
}

export default function CreateBookPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [chapters, setChapters] = useState<Chapter[]>([
    { title: "Chapter 1", heading: "", content: "" }
  ]);

  // Logic to calculate length based on industry standard 250 words per page
  const calculateTotalPages = () => {
    const totalWords = chapters.reduce((acc, ch) => acc + ch.content.split(/\s+/).filter(Boolean).length, 0);
    return Math.max(1, Math.ceil(totalWords / 250));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
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
    
    // ✅ Data alignment for the backend
    formData.append("estimatedPages", calculateTotalPages().toString());
    formData.append("chapters", JSON.stringify(chapters));
    formData.append("category", "Fiction"); // Default category for draft

    try {
      const res = await fetch(`${REST_API}/publish-books/admin/books`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        router.push("/dashboard"); 
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Failed to save book"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24 min-h-screen bg-[#fcfcfc]">
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/" className="text-sm font-bold text-[#035b77] hover:underline flex items-center gap-1">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black mt-2 text-gray-900 tracking-tight">Writer&apos;s Studio</h1>
          <p className="text-gray-500 font-medium">Draft your masterpiece. Your work is stored as searchable text.</p>
        </div>
        
        <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-2xl text-right flex items-center gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Length Estimate</p>
            <p className="text-xl font-black text-[#035b77] flex items-center justify-end gap-1">
              <Hash size={18} className="text-sky-300" /> {calculateTotalPages()} Pages
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Book Metadata Section */}
        <section className="bg-white p-8 border border-gray-100 rounded-[2rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Book Title</label>
              <input 
                name="title" 
                required 
                className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-sky-100 text-xl font-bold text-gray-800 placeholder:text-gray-300" 
                placeholder="The Silent Forest..." 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Synopsis</label>
              <textarea 
                name="description" 
                required 
                rows={4} 
                className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-sky-100 text-gray-700 leading-relaxed placeholder:text-gray-300" 
                placeholder="What is this story about?" 
              />
            </div>
          </div>

          {/* Public Cover Upload Only */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[1.5rem] p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
             <label className="cursor-pointer text-center group">
                {preview ? (
                   <div className="relative">
                      <img src={preview} alt="Cover" className="w-36 h-52 object-cover rounded-xl shadow-2xl mb-3 transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                         <ImageIcon className="text-white" size={24} />
                      </div>
                   </div>
                ) : (
                   <div className="w-36 h-52 bg-white rounded-xl flex flex-col items-center justify-center text-gray-300 mb-3 border border-gray-100 shadow-inner">
                      <ImageIcon size={40} strokeWidth={1.5} />
                      <span className="text-[10px] font-black uppercase tracking-tighter mt-3">Add Cover</span>
                   </div>
                )}
                <input type="file" name="cover" accept="image/*" required onChange={handleImageChange} className="hidden" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public Cover Image</p>
             </label>
          </div>
        </section>

        {/* Chapter Editing Area */}
        <div className="space-y-8">
          <div className="flex justify-between items-center sticky top-4 z-30 px-4 py-3 bg-[#035b77]/90 backdrop-blur-md rounded-2xl shadow-lg shadow-sky-900/20">
            <div className="flex items-center gap-2 text-white">
               <BookOpen size={20} />
               <h2 className="font-black text-sm uppercase tracking-[0.2em]">Manuscript Chapters</h2>
            </div>
            <button 
              type="button" 
              onClick={addChapter} 
              className="flex items-center gap-2 bg-white text-[#035b77] px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-colors shadow-sm"
            >
              <Plus size={16} strokeWidth={3} /> Add Chapter
            </button>
          </div>

          {chapters.map((chapter, index) => (
            <div key={index} className="group bg-white p-8 border border-gray-100 rounded-[2rem] relative shadow-sm hover:shadow-xl transition-all duration-300">
              <button 
                type="button" 
                onClick={() => removeChapter(index)} 
                className={`absolute -top-3 -right-3 bg-white shadow-md p-2 rounded-full text-gray-300 hover:text-red-500 hover:scale-110 transition-all border border-gray-50 ${chapters.length === 1 ? 'hidden' : ''}`}
              >
                <Trash2 size={18} />
              </button>
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 border-b border-gray-50 pb-6">
                  <div className="sm:w-1/3">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 block">Chapter Label</label>
                    <input
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, "title", e.target.value)}
                      className="text-2xl font-black text-[#035b77] outline-none w-full bg-transparent placeholder:text-gray-200"
                      placeholder={`Chapter ${index + 1}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 block">Display Subtitle</label>
                    <input
                      value={chapter.heading}
                      onChange={(e) => updateChapter(index, "heading", e.target.value)}
                      className="text-xl font-bold text-gray-800 outline-none w-full bg-transparent placeholder:text-gray-200"
                      placeholder="The Beginning of the End..."
                    />
                  </div>
                </div>

                <textarea
                  value={chapter.content}
                  onChange={(e) => updateChapter(index, "content", e.target.value)}
                  rows={15}
                  className="w-full p-0 border-none bg-transparent outline-none text-gray-700 leading-[1.8] font-serif text-xl placeholder:text-gray-200 resize-none"
                  placeholder="Start writing your story here..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#035b77] text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.2em] hover:bg-[#024a61] shadow-2xl shadow-sky-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <><Save size={24} /> Save Book Draft</>
          )}
        </button>
      </form>
    </div>
  );
}

// Helper icon for back button
function ChevronLeft({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}