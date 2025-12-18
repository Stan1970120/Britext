// app/(admin)/books/page.tsx
import Link from "next/link";

export default function BooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Books</h1>
        <Link
          href="/books/upload"
          className="bg-slate-900 text-white px-5 py-2 rounded-lg"
        >
          Upload Book
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th>Price</th>
              <th>Stock</th>
              <th>ISBN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">Digital Marketing 101</td>
              <td>₦5,000</td>
              <td>120</td>
              <td>978-123456</td>
              <td className="space-x-2">
                <button className="text-blue-600">Edit</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
