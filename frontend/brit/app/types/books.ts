import { ReactNode } from "react";

export type BookStatus = "draft" | "published";

export interface Book {
    description: ReactNode;
    _id: string;
    title: string;
    author: string;
    category: string;
    language: string;

    summary?: string;
    price?: number;

    coverImage: string; // URL from backend

    status: BookStatus;

    createdAt: string;
    updatedAt?: string;
    publishedAt?: string;
}

export interface Chapter {
    _id: string;
    title: string;
    content: string; // TipTap JSON or HTML
    order: number;
}
