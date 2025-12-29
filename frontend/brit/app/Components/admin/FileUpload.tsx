"use client";

import { useRef, useState } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  onFileSelect: (file: File) => void;
}

export default function FileUpload({
  label = "Upload cover image",
  accept = "image/*",
  onFileSelect,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="border-2 border-dashed rounded-xl p-6 text-center">
      <p className="text-gray-700 font-medium">{label}</p>
      <p className="text-xs text-gray-400 mt-1">
        JPG, PNG or WEBP
      </p>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Preview"
          className="mx-auto mt-4 h-40 object-contain rounded-lg"
        />
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 px-6 py-2 border rounded-full text-sm hover:bg-gray-50"
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
