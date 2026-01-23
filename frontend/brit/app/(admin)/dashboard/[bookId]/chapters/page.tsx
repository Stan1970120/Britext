"use client";

import { useState } from "react";
import { API } from "../../../../constant/api";
import RichTextEditor from "../../../../Components/admin/editor/RichTextEditor";
import { useAuth } from "@/app/context/AuthContext"; // Added for auth

interface PageProps {
  params: {
    bookId: string;
  };
}

export default function ChaptersPage({ params }: PageProps) {
  const { token } = useAuth(); // Retrieve the admin token
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const saveChapter = async () => {
    if (!title || !content) return;
    if (!token) {
      setMessage({ type: 'error', text: "You must be logged in as an admin." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // We use PATCH because your publishbook.routes.js defines chapters as a PATCH endpoint
      const response = await fetch(API.ADD_CHAPTER(params.bookId), {
        method: "PATCH", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Added Authorization header
        },
        body: JSON.stringify({
          title,
          content, // HTML from TipTap
          order: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save chapter");
      }

      setTitle("");
      setContent("");
      setMessage({ type: 'success', text: "Chapter saved successfully!" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Connection failed";
      setMessage({ type: 'error', text: errMsg });
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Write Chapter</h1>
        {message && (
          <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </span>
        )}
      </div>

      <input
        placeholder="Chapter title"
        className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-[#035b77] outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <RichTextEditor value={content} onChange={setContent} />

      <div className="flex justify-end">
        <button
          onClick={saveChapter}
          disabled={saving}
          className={`bg-[#035b77] text-white px-8 py-3 rounded-full font-bold shadow-lg transition-opacity ${
            saving ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : "Save Chapter"}
        </button>
      </div>
    </div>
  );
}