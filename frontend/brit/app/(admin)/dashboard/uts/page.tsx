"use client";

import { API } from "../../../constant/api";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    bookId: string;
  };
}

export default function PublishBook({ params }: PageProps) {
  const router = useRouter();

  const publish = async () => {
    await fetch(API.PUBLISH_BOOK(params.bookId), {
      method: "PATCH",
      credentials: "include",
    });

    router.push("/books");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Publish Book</h1>
      <p>Once published, readers can access this book.</p>

      <button
        onClick={publish}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        Publish Now
      </button>
    </div>
  );
}
