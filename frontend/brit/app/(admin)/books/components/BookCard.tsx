import Link from "next/link";
import { Book } from "../../../types/books";

interface BookCardProps {
  book: Book;
  onPublish?: (id: string) => void;
}

export default function BookCard({ book, onPublish }: BookCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 flex gap-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Book Cover */}
      <div className="relative w-24 h-36 flex-shrink-0">
        <img
          src={book.coverImage || "/placeholder-cover.jpg"}
          alt={book.title}
          className="w-full h-full object-cover rounded-lg shadow-sm"
        />
        {/* Status Badge Overlay */}
        <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
          book.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {book.status}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 leading-tight">{book.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">{book.category || "Uncategorized"}</p>
          <p className="text-md font-medium text-gray-700 mt-2">
            {book.price ? `$${book.price}` : <span className="text-gray-300 text-sm">No price set</span>}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
          <Link
            href={`/admin/books/${book._id}/chapters`}
            className="text-sm font-semibold text-[#035b77] hover:underline"
          >
            Edit Content
          </Link>

          <Link
            href={`/preview/${book._id}`}
            className="text-sm font-semibold text-gray-600 hover:text-black hover:underline"
          >
            Preview
          </Link>

          {book.status === "draft" && onPublish && (
            <button
              onClick={() => onPublish(book._id)}
              className="text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1 rounded-md transition-colors ml-auto"
            >
              Publish Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}