"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API } from "@/app/constant/api";
import Link from "next/link";
import RichTextEditor from "../../../../Components/admin/editor/RichTextEditor";
import { useAuth } from "@/app/context/AuthContext"; // Added for auth

interface Chapter {
  _id: string;
  title: string;
  content: string;
  order: number;
}

export default function ChapterEditorPage() {
  // Use bookId instead of id to match your folder name
  const { bookId } = useParams(); 
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Fetch Chapters
  const fetchChapters = async () => {
    try {
      const res = await fetch(API.GET_CHAPTERS(bookId as string), { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
        if (data.length > 0 && !selectedChapter) setSelectedChapter(data[0]);
      }
    } catch (err) {
      console.error("Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (bookId) fetchChapters(); 
  }, [bookId]);

  // 2. Save/Update Chapter
  const handleSave = async () => {
    if (!selectedChapter) return;
    setSaving(true);
    try {
      const res = await fetch(`${API.ADD_CHAPTER(bookId as string)}/${selectedChapter._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedChapter),
        credentials: "include",
      });
      if (res.ok) alert("Chapter saved!");
    } catch (err) {
      alert("Error saving chapter");
    } finally {
      setSaving(false);
    }
  };

  // 3. Add New Chapter
  const addNewChapter = async () => {
    const title = prompt("Enter Chapter Title:");
    if (!title) return;

    try {
      const res = await fetch(API.ADD_CHAPTER(bookId as string), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: "", order: chapters.length + 1 }),
        credentials: "include",
      });
      if (res.ok) fetchChapters();
    } catch (err) {
      alert("Failed to add chapter");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Manuscript...</div>;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Navigation */}
      <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-4">
          <Link href="/books" className="text-gray-500 hover:text-black">← Back</Link>
          <h1 className="font-bold text-lg">Manuscript Editor</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/preview/${bookId}`} className="px-4 py-2 border rounded-md text-sm font-medium">Preview</Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#035b77] text-white px-6 py-2 rounded-md text-sm font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Chapter"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Chapter List */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto p-4 space-y-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold uppercase text-gray-400">Chapters</h2>
            <button onClick={addNewChapter} className="text-[#035b77] text-xl font-bold">+</button>
          </div>
          {chapters.map((ch) => (
            <button
              key={ch._id}
              onClick={() => setSelectedChapter(ch)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedChapter?._id === ch._id ? "bg-[#035b77] text-white" : "hover:bg-gray-200"
              }`}
            >
              {ch.title}
            </button>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto">
          {selectedChapter ? (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <input
                value={selectedChapter.title}
                onChange={(e) => setSelectedChapter({...selectedChapter, title: e.target.value})}
                className="text-4xl font-serif font-bold w-full outline-none border-b border-transparent focus:border-gray-200 pb-2"
                placeholder="Chapter Title"
              />
              
              {/* Swapped textarea for your RichTextEditor */}
              <RichTextEditor 
                value={selectedChapter.content} 
                onChange={(newContent) => setSelectedChapter({...selectedChapter, content: newContent})} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Select a chapter or create a new one to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}