"use client";

import { useEffect, useState } from "react";
import { API } from "../../../../constant/api";
import type { Book, Chapter } from "../../../../types/books";

interface PreviewResponse {
  book: Book;
  chapters: Chapter[];
}

interface PageProps {
  params: {
    bookId: string;
  };
}

export default function PreviewBook({ params }: PageProps) {
  const [data, setData] = useState<PreviewResponse | null>(null);

  useEffect(() => {
    fetch(API.PREVIEW_BOOK(params.bookId), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData: PreviewResponse) => setData(resData));
  }, [params.bookId]);

  if (!data) return null;

  return (
    <div className="prose max-w-3xl">
      <h1>{data.book.title}</h1>

      {data.chapters.map((ch) => (
        <div key={ch._id}>
          <h2>{ch.title}</h2>
          <div
            dangerouslySetInnerHTML={{ __html: ch.content }}
          />
        </div>
      ))}
    </div>
  );
}
