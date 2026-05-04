"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import MyCart from "./Components/MyCart";
import Payment from "./Components/Payment";
import Confirmation from "./Components/Confirmation";
import { API } from "../../constant/api"; 

export type CartItem = {
  bookId: string;
  quantity: number;
  book?: {
    _id: string;
    title: string;
    category: string;
    price: number;
    coverImage?: string;
  };
};

interface AppUser {
  id: string;
}

const CartPage = () => {
  const [step, setStep] = useState<"cart" | "payment" | "confirmation">("cart");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  const { user, token, loading: authLoading } = useAuth() as { 
    user: AppUser | null; 
    token: string | null; 
    loading: boolean 
  };
  
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/checkout";

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth?redirect=${redirectTo}`);
    }
  }, [user, authLoading, router, redirectTo]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        setLoadingCart(true);
        
        
        const res = await fetch(API.CART, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCartItems(data?.items || []);
        } else {
          console.error("Failed to fetch cart:", res.statusText);
        }
      } catch (err) {
        console.error("Failed to load cart", err);
      } finally {
        setLoadingCart(false);
      }
    };

    if (token) fetchCart();
  }, [token]);

  const goToPayment = () => {
    if (cartItems.length === 0) return;
    setStep("payment");
  };

  const renderStep = () => {
    switch (step) {
      case "cart":
        return (
          <MyCart
            cartItems={cartItems}
            setCartItems={setCartItems}
            onNext={goToPayment}
          />
        );
      case "payment":
        return (
          <Payment
            cartItems={cartItems}
            onNext={() => setStep("confirmation")}
            onBack={() => setStep("cart")}
          />
        );
      case "confirmation":
        return <Confirmation onBack={() => setStep("cart")} />;
      default:
        return null;
    }
  };

  if (authLoading || (loadingCart && user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-[#005F7A] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-20">
      <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

      <div className="flex items-center gap-3 text-sm font-medium mb-10">
        <button
          onClick={() => setStep("cart")}
          className={step === "cart" ? "text-[#005F7A] font-bold" : "text-gray-500"}
        >
          My Cart
        </button>
        <span className="text-gray-300">–</span>
        <button
          disabled={step === "cart"}
          onClick={() => setStep("payment")}
          className={step === "payment" ? "text-[#005F7A] font-bold" : "text-gray-400"}
        >
          Payment
        </button>
        <span className="text-gray-300">–</span>
        <button
          disabled
          className={step === "confirmation" ? "text-[#005F7A] font-bold" : "text-gray-400"}
        >
          Confirmation
        </button>
      </div>

      {renderStep()}
    </div>
  );
};

export default CartPage;