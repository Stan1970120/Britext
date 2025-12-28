import { Book } from "../../../types/books";

interface BookCardProps {
  book: Book;
  onPublish?: (id: string) => void;
}

export default function BookCard({ book, onPublish }: BookCardProps) {
  return (
    <div className="border rounded-2xl p-4 flex gap-4">
      <img
        src={book.coverImage}
        alt={book.title}
        className="w-24 h-32 object-cover rounded-lg"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-lg">{book.title}</h3>
        <p className="text-sm text-gray-500">{book.category}</p>

        <p className="text-sm mt-1">${book.price}</p>

        <div className="flex gap-3 mt-4">
          <a
            href={`/admin/books/${book._id}/chapters`}
            className="text-sm text-[#035b77]"
          >
            Edit
          </a>

          {book.status === "draft" && onPublish && (
            <button
              onClick={() => onPublish(book._id)}
              className="text-sm text-green-600"
            >
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
