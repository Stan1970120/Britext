import Link from "next/link";
import { Book } from "@/app/types/books";

// 1. Define your backend root URL (no /api for static files like images)
const BACKEND_URL = "https://britext.onrender.com";

export default function BookCard({ book }: { book: Book }) {
  
  // 2. Helper to resolve the image path
  const getCoverUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    // If it's already a full URL, return it
    if (imagePath.startsWith("http")) return imagePath;
    // Otherwise, prepend the Render backend root URL
    return `${BACKEND_URL}/${imagePath}`;
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-6 hover:border-[#035b77]/30 transition-all shadow-sm">
      <div className="w-16 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
        {book.coverImage ? (
          <img 
            src={getCoverUrl(book.coverImage)!} 
            alt={book.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Cover";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase p-1 text-center font-bold">No Cover</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-gray-900 truncate">{book.title}</h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{book.category || "General Content"}</p>
        
        <div className="flex gap-4">
          {/* ✨ FIXED: Path updated to match your file structure /dashboard/[bookId]/chapters */}
          <Link href={`/dashboard/${book._id}/chapters`} className="text-xs font-bold text-[#035b77] hover:underline">
            Edit Chapters
          </Link>
          <Link href={`/preview/${book._id}`} className="text-xs font-bold text-gray-600 hover:underline">
            Preview View
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {book.status === "draft" ? (
          <Link 
            href={`/publish/${book._id}`} 
            className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm transition-colors"
          >
            Finalize & Publish
          </Link>
        ) : (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold uppercase">Published</span>
        )}
        <p className="text-sm font-black text-gray-900">{book.price ? `$${book.price}` : "--"}</p>
      </div>
    </div>
  );
}