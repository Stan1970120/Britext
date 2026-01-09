"use client";

import { useState } from "react";
import { API } from "../../../constant/api";
import { useRouter } from "next/navigation";

/** 1️⃣ Define a strict type for the form */
type CreateBookForm = {
  title: string;
  author: string;
  category: string;
  language: string;
};

/** 2️⃣ Explicitly type the fields */
const FIELDS: Array<keyof CreateBookForm> = [
  "title",
  "author",
  "category",
  "language",
];

export default function CreateBookPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateBookForm>({
    title: "",
    author: "",
    category: "",
    language: "",
  });

  const handleSubmit = async () => {
    const res = await fetch(API.CREATE_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data: { _id: string } = await res.json();
    router.push(`/admin/books/${data._id}`);
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Create Book</h1>

      {FIELDS.map((field) => (
        <input
          key={field}
          placeholder={field}
          className="w-full border p-3 rounded"
          value={form[field]}
          onChange={(e) =>
            setForm({
              ...form,
              [field]: e.target.value,
            })
          }
        />
      ))}

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-6 py-3 rounded"
      >
        Save as Draft
      </button>
    </div>
  );
}
