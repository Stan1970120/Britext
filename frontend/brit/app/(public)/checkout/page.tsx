"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import MyCart from "./Components/MyCart";
import Payment from "./Components/Payment";
import Confirmation from "./Components/Confirmation";


export type CartItem = {
  _id: string;
  book: {
    _id: string;
    title: string;
    category: string;
    price: number;
  };
};

const CartPage = () => {
  const [step, setStep] = useState<"cart" | "payment" | "confirmation">("cart");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/checkout";

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/signin?redirect=${redirectTo}`);
    }
  }, [user, authLoading, router, redirectTo]);

  // 🛒 Fetch cart ONCE
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setCartItems(data?.items || []);
      } catch (err) {
        console.error("Failed to load cart");
      } finally {
        setLoadingCart(false);
      }
    };

    if (token) fetchCart();
  }, [token]);

  // 🚫 Prevent going to payment if cart is empty
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
        return <Confirmation onBack={function (): void {
          throw new Error("Function not implemented.");
        } } />;

      default:
        return null;
    }
  };

  // 🔄 Loader (auth + cart)
  if (authLoading || loadingCart || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-20">
      <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

      {/* Step Navigation */}
      <div className="flex items-center gap-3 text-sm font-medium mb-10">
        <button
          onClick={() => setStep("cart")}
          className={step === "cart" ? "font-semibold" : "text-gray-500"}
        >
          My Cart
        </button>
        <span>–</span>
        <button
          disabled={step === "cart"}
          className={step === "payment" ? "font-semibold" : "text-gray-400"}
        >
          Payment
        </button>
        <span>–</span>
        <button
          disabled
          className={step === "confirmation" ? "font-semibold" : "text-gray-400"}
        >
          Confirmation
        </button>
      </div>

      {renderStep()}
    </div>
  );
};

export default CartPage;
