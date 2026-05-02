// app/(admin)/books/upload/page.tsx
"use client";

export default function UploadBookPage() {
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow space-y-6">
      <h1 className="text-2xl font-semibold">Upload New Book</h1>

      {/* File Upload */}
      <div className="border-2 border-dashed rounded-xl p-10 text-center">
        <p className="text-gray-600">
          Drag & drop book file or cover image
        </p>
        <p className="text-xs text-gray-400">
          PDF, EPUB, JPG — Max 30MB
        </p>
        <button className="mt-4 px-6 py-2 border rounded-full">
          Browse files
        </button>
      </div>

      {/* Book Form */}
      <div className="grid grid-cols-3 gap-4">
        <input className="input" placeholder="Title" />
        <input className="input" placeholder="Pages" />
        <input className="input" placeholder="Price" />

        <input className="input" placeholder="Quantity" />
        <input className="input" placeholder="Published Date" />
        <input className="input" placeholder="ISBN 10" />

        <input className="input" placeholder="ISBN 13" />
        <input className="input" placeholder="Edition" />
      </div>

      <textarea
        className="input h-28"
        placeholder="Book description"
      />

      <button className="bg-slate-900 text-white px-8 py-3 rounded-full">
        Upload Book
      </button>
    </div>
  );
}
