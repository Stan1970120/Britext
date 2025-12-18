// types/book.ts
export interface Book {
    id?: string;
    title: string;
    pages: number;
    price: number;
    quantity: number;
    isbn10?: string;
    isbn13?: string;
    publishedDate?: string;
    edition?: string;
    description: string;
    fileUrl?: string;
    coverImage?: string;
}
