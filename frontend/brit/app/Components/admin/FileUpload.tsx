// components/admin/FileUpload.tsx
"use client";

import { useRef } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
}

export default function FileUpload({
  label = "Upload file",
  accept = "*",
  onFileSelect,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) onFileSelect(file);
  };

  return (
    <div className="border-2 border-dashed rounded-xl p-8 text-center">
      <p className="text-gray-600">{label}</p>
      <p className="text-xs text-gray-400 mt-1">
        Drag & drop or browse
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 px-6 py-2 border rounded-full text-sm"
      >
        Browse file
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        hidden
      />
    </div>
  );
}
