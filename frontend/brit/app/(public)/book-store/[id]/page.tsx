"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCart, ArrowLeft, Star, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import SimilarPost from "@/Components/SimilarPost";
import AboutAuthor from "@/Components/AboutAuthor";
import CommentSection from "@/Components/CommentSection";
import { REST_API } from "../../../constant";

export default function BookDetails() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [book, setBook] = useState<unknown>(null);
  const [rating, setRating] = useState(2.5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* --------------------------- FETCH BOOK --------------------------- */
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${REST_API}/books/${bookId}`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        });
        const data = await res.json();
        setBook(data);
        setRating(data.rating);
        setIsAddedToCart(data.isInCart);
        setIsSaved(data.isWishlisted);
      } catch (error) {
        console.error("Failed to fetch book", error);
      }
    };
    fetchBook();
  }, [bookId]);

  /* --------------------------- RATING --------------------------- */
  const handleRatingClick = async (value: number) => {
    try {
      await fetch(`${REST_API}/books/${bookId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: value }),
      });
      setRating(value);
    } catch (error) {
      console.error("Failed to rate book", error);
    }
  };

  /* --------------------------- CART & WISHLIST --------------------------- */
  const handleAddToCart = async () => {
    try {
      const res = await fetch(`${REST_API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) setIsAddedToCart(true);
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };

  const handleSaveForLater = async () => {
    try {
      const res = await fetch(`${REST_API}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) setIsSaved(true);
    } catch (error) {
      console.error("Failed to save for later", error);
    }
  };

  const handleBuyNow = () => router.push("/payment");

  const handleUseCode = () => {
    const encodedCode = encodeURIComponent(discountCode.trim());
    router.push(`/cart/payment?discount=${encodedCode}`);
  };

  if (!book) return null;

  return (
    <section className="px-4 md:px-10 py-10 max-w-7xl mx-auto font-sans">
      {/* ...Keep your current UI, but replace all cart & wishlist logic with above API hooks */}
    </section>
  );
}
