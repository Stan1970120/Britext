"use client";

import { useEffect, useState } from "react";
import { API } from "../../../constant/api";
import Link from "next/link";
import type { Book } from "../../../types/books";

interface PageProps {
  params: {
    bookId: string;
  };
}

export default function BookOverview({ params }: PageProps) {
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    fetch(API.GET_BOOK(params.bookId), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: Book) => setBook(data));
  }, [params.bookId]);

  if (!book) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{book.title}</h1>
      <p>Status: {book.status}</p>

      <div className="flex gap-4">
        <Link href={`/admin/books/${book._id}/chapters`}>
          Write Chapters
        </Link>
        <Link href={`/admin/books/${book._id}/preview`}>
          Preview
        </Link>
        <Link href={`/admin/books/${book._id}/publish`}>
          Publish
        </Link>
      </div>
    </div>
  );
}
