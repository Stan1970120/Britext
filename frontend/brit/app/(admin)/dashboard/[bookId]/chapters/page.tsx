"use client";

import { useState } from "react";
import { API } from "../../../../constant/api";
import RichTextEditor from "../../../../Components/admin/editor/RichTextEditor";

interface PageProps {
  params: {
    bookId: string;
  };
}

export default function ChaptersPage({ params }: PageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const saveChapter = async () => {
    if (!title || !content) return;

    setSaving(true);

    await fetch(API.ADD_CHAPTER(params.bookId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title,
        content, // HTML from TipTap
        order: Date.now(),
      }),
    });

    setTitle("");
    setContent("");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Write Chapter</h1>

      <input
        placeholder="Chapter title"
        className="border rounded-lg p-3 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <RichTextEditor value={content} onChange={setContent} />

      <button
        onClick={saveChapter}
        disabled={saving}
        className="bg-[#035b77] text-white px-6 py-3 rounded-full"
      >
        {saving ? "Saving..." : "Save Chapter"}
      </button>
    </div>
  );
}
