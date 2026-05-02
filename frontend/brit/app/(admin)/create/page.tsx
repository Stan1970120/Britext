"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REST_API } from "../../constant"; 
import Link from "next/link";
import { Plus, Trash2, Image as ImageIcon, Loader2, Save, BookOpen, FileText, Upload, ChevronLeft } from "lucide-react";
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
  
  const [creationMode, setCreationMode] = useState<"write" | "upload">("upload");
  
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

  const addChapter = () => setChapters([...chapters, { 
    title: `Chapter ${chapters.length + 1}`, 
    heading: "", 
    content: "" 
  }]);

  const removeChapter = (index: number) => {
    if (chapters.length > 1) setChapters(chapters.filter((_, i) => i !== index));
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
    
    if (creationMode === "write") {
      formData.append("estimatedPages", calculateTotalPages().toString());
      
      const textData = chapters.map(ch => ({
        title: ch.title,
        heading: ch.heading,
        content: ch.content
      }));
      formData.append("chaptersData", JSON.stringify(textData));
    }
    
    formData.append("category", "Uncategorized");
    formData.append("creationMode", creationMode);

    try {
      const res = await fetch(`${REST_API}/publish-books/admin/books`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const resData = await res.json();

      if (res.ok) {
        router.push("/dashboard"); 
      } else {
        alert(`Server Error: ${resData.error || resData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24 min-h-screen bg-[#fcfcfc]">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-[#035b77] hover:underline flex items-center gap-1">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black mt-2 text-gray-900 tracking-tight">Writer&apos;s Studio</h1>
          <p className="text-gray-500 font-medium">Draft your masterpiece or upload professional formats.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button type="button" onClick={() => setCreationMode("upload")} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${creationMode === 'upload' ? 'bg-white text-[#035b77] shadow-sm' : 'text-gray-400'}`}>
            FILE UPLOAD
          </button>
          <button type="button" onClick={() => setCreationMode("write")} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${creationMode === 'write' ? 'bg-white text-[#035b77] shadow-sm' : 'text-gray-400'}`}>
            MANUAL WRITE
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="bg-white p-8 border border-gray-100 rounded-[2rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Book Title</label>
              <input name="title" required className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-sky-100 text-xl font-bold text-gray-800" placeholder="The Silent Forest..." />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Synopsis</label>
              <textarea name="description" required rows={4} className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-sky-100 text-gray-700 leading-relaxed" placeholder="What is this story about?" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[1.5rem] p-6 bg-gray-50/50">
             <label className="cursor-pointer text-center group">
                {preview ? (
                   <img src={preview} alt="Cover" className="w-36 h-52 object-cover rounded-xl shadow-2xl mb-3" />
                ) : (
                   <div className="w-36 h-52 bg-white rounded-xl flex flex-col items-center justify-center text-gray-300 mb-3 border border-gray-100 shadow-inner">
                      <ImageIcon size={40} />
                      <span className="text-[10px] font-black uppercase tracking-tighter mt-3">Add Cover</span>
                   </div>
                )}
                <input type="file" name="cover" aria-label="Upload book cover image" accept="image/*" required onChange={handleImageChange} className="hidden" />
             </label>
          </div>
        </section>

        {creationMode === "upload" ? (
          <section className="bg-white p-8 border border-gray-100 rounded-[2rem] shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <Upload className="text-[#035b77]" />
              <h2 className="font-black text-sm uppercase tracking-[0.2em] text-gray-800">Upload Documents</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-sky-50/50 border border-sky-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><FileText className="text-blue-600" size={20} /></div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">MS Word Format</p>
                </div>
                <input type="file" name="docFile" aria-label="Upload Word Document" accept=".doc,.docx" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#035b77] file:text-white" />
              </div>

              <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><BookOpen className="text-purple-600" size={20} /></div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">EPub Format</p>
                </div>
                <input type="file" name="epubFile" aria-label="Upload EPub File" accept=".epub" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#035b77] file:text-white" />
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center sticky top-4 z-30 px-4 py-3 bg-[#035b77]/90 backdrop-blur-md rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 text-white">
                 <BookOpen size={20} />
                 <h2 className="font-black text-sm uppercase tracking-[0.2em]">Manuscript</h2>
              </div>
              <button type="button" onClick={addChapter} className="flex items-center gap-2 bg-white text-[#035b77] px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-colors">
                <Plus size={16} /> Add Chapter
              </button>
            </div>

            {chapters.map((chapter, index) => (
              <div key={index} className="bg-white p-8 border border-gray-100 rounded-[2rem] relative shadow-sm">
                <button 
                  type="button" 
                  onClick={() => removeChapter(index)} 
                  aria-label={`Remove ${chapter.title || 'Chapter'}`} 
                  className={`absolute -top-3 -right-3 bg-white shadow-md p-2 rounded-full text-gray-300 hover:text-red-500 ${chapters.length === 1 ? 'hidden' : ''}`}
                >
                  <Trash2 size={18} />
                </button>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={chapter.title} onChange={(e) => updateChapter(index, "title", e.target.value)} className="text-2xl font-black text-[#035b77] outline-none w-full bg-transparent" placeholder="Chapter Title" />
                    <input value={chapter.heading} onChange={(e) => updateChapter(index, "heading", e.target.value)} className="text-xl font-bold text-gray-400 outline-none w-full bg-transparent" placeholder="Subtitle (Optional)" />
                  </div>
                  
                  <textarea value={chapter.content} onChange={(e) => updateChapter(index, "content", e.target.value)} rows={12} className="w-full border-none bg-transparent outline-none text-gray-700 font-serif text-xl resize-none" placeholder="Start writing..." />
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-[#035b77] text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3">
          {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Create Manuscript</>}
        </button>
      </form>
    </div>
  );
}


/*
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REST_API } from "../../constant"; 
import Link from "next/link";
import { Plus, Trash2, Image as ImageIcon, Loader2, Save, BookOpen, FileText, Upload, ChevronLeft } from "lucide-react";
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
  
  const [creationMode, setCreationMode] = useState<"write" | "upload">("upload");
  
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

  const addChapter = () => setChapters([...chapters, { 
    title: `Chapter ${chapters.length + 1}`, 
    heading: "", 
    content: "" 
  }]);

  const removeChapter = (index: number) => {
    if (chapters.length > 1) setChapters(chapters.filter((_, i) => i !== index));
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
    
    if (creationMode === "write") {
      formData.append("estimatedPages", calculateTotalPages().toString());
      
      const textData = chapters.map(ch => ({
        title: ch.title,
        heading: ch.heading,
        content: ch.content
      }));
      formData.append("chaptersData", JSON.stringify(textData));
    }
    
    formData.append("category", "Uncategorized");
    formData.append("creationMode", creationMode);

    try {
      const res = await fetch(`${REST_API}/publish-books/admin/books`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const resData = await res.json();

      if (res.ok) {
        router.push("/dashboard"); 
      } else {
        alert(`Server Error: ${resData.error || resData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24 min-h-screen bg-[#fcfcfc]">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-[#035b77] hover:underline flex items-center gap-1">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black mt-2 text-gray-900 tracking-tight">Writer&apos;s Studio</h1>
          <p className="text-gray-500 font-medium">Draft your masterpiece or upload professional formats.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button type="button" onClick={() => setCreationMode("upload")} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${creationMode === 'upload' ? 'bg-white text-[#035b77] shadow-sm' : 'text-gray-400'}`}>
            FILE UPLOAD
          </button>
          <button type="button" onClick={() => setCreationMode("write")} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${creationMode === 'write' ? 'bg-white text-[#035b77] shadow-sm' : 'text-gray-400'}`}>
            MANUAL WRITE
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="bg-white p-8 border border-gray-100 rounded-[2rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Book Title</label>
              <input name="title" required className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-sky-100 text-xl font-bold text-gray-800" placeholder="The Silent Forest..." />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Synopsis</label>
              <textarea name="description" required rows={4} className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 ring-sky-100 text-gray-700 leading-relaxed" placeholder="What is this story about?" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[1.5rem] p-6 bg-gray-50/50">
             <label className="cursor-pointer text-center group">
                {preview ? (
                   <img src={preview} alt="Cover" className="w-36 h-52 object-cover rounded-xl shadow-2xl mb-3" />
                ) : (
                   <div className="w-36 h-52 bg-white rounded-xl flex flex-col items-center justify-center text-gray-300 mb-3 border border-gray-100 shadow-inner">
                      <ImageIcon size={40} />
                      <span className="text-[10px] font-black uppercase tracking-tighter mt-3">Add Cover</span>
                   </div>
                )}
                <input type="file" name="cover" accept="image/*" required onChange={handleImageChange} className="hidden" />
             </label>
          </div>
        </section>

        {creationMode === "upload" ? (
          <section className="bg-white p-8 border border-gray-100 rounded-[2rem] shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <Upload className="text-[#035b77]" />
              <h2 className="font-black text-sm uppercase tracking-[0.2em] text-gray-800">Upload Documents</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-sky-50/50 border border-sky-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><FileText className="text-blue-600" size={20} /></div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">MS Word Format</p>
                </div>
                <input type="file" name="docFile" accept=".doc,.docx" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#035b77] file:text-white" />
              </div>

              <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><BookOpen className="text-purple-600" size={20} /></div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">EPub Format</p>
                </div>
                <input type="file" name="epubFile" accept=".epub" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#035b77] file:text-white" />
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center sticky top-4 z-30 px-4 py-3 bg-[#035b77]/90 backdrop-blur-md rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 text-white">
                 <BookOpen size={20} />
                 <h2 className="font-black text-sm uppercase tracking-[0.2em]">Manuscript</h2>
              </div>
              <button type="button" onClick={addChapter} className="flex items-center gap-2 bg-white text-[#035b77] px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-colors">
                <Plus size={16} /> Add Chapter
              </button>
            </div>

            {chapters.map((chapter, index) => (
              <div key={index} className="bg-white p-8 border border-gray-100 rounded-[2rem] relative shadow-sm">
                <button type="button" onClick={() => removeChapter(index)} className={`absolute -top-3 -right-3 bg-white shadow-md p-2 rounded-full text-gray-300 hover:text-red-500 ${chapters.length === 1 ? 'hidden' : ''}`}>
                  <Trash2 size={18} />
                </button>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={chapter.title} onChange={(e) => updateChapter(index, "title", e.target.value)} className="text-2xl font-black text-[#035b77] outline-none w-full bg-transparent" placeholder="Chapter Title" />
                    <input value={chapter.heading} onChange={(e) => updateChapter(index, "heading", e.target.value)} className="text-xl font-bold text-gray-400 outline-none w-full bg-transparent" placeholder="Subtitle (Optional)" />
                  </div>
                  
                  <textarea value={chapter.content} onChange={(e) => updateChapter(index, "content", e.target.value)} rows={12} className="w-full border-none bg-transparent outline-none text-gray-700 font-serif text-xl resize-none" placeholder="Start writing..." />
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-[#035b77] text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3">
          {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Create Manuscript</>}
        </button>
      </form>
    </div>
  );
}

*/