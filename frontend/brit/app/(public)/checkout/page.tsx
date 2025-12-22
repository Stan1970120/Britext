"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext"; // make sure path is correct
import MyCart from "./Components/MyCart";
import Payment from "./Components/Payment";
import Confirmation from "./Components/Confirmation";

const CartPage = () => {
  const [step, setStep] = useState<"cart" | "payment" | "confirmation">("cart");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/checkout";

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/signin?redirect=${redirectTo}`);
    }
  }, [user, authLoading, router, redirectTo]);

  // Step renderer
  const renderStep = () => {
    switch (step) {
      case "cart":
        return <MyCart onNext={() => setStep("payment")} />;
      case "payment":
        return <Payment
          onNext={() => setStep("confirmation")}
          onBack={() => setStep("cart")}
        />;
      case "confirmation":
        return <Confirmation onBack={() => setStep("payment")} />;
      default:
        return null;
    }
  };

  // Show loader while checking auth or redirecting
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center gap-3 text-sm font-medium mb-10">
        <button
          onClick={() => setStep("cart")}
          className={`transition ${step === "cart" ? "text-black font-semibold" : "text-gray-500 hover:text-black"}`}
        >
          My Cart
        </button>
        <span>–</span>
        <button
          onClick={() => step !== "cart" && setStep("payment")}
          disabled={step === "cart"}
          className={`transition ${step === "payment" ? "text-black font-semibold" : "text-gray-500 hover:text-black"} ${step === "cart" && "cursor-not-allowed opacity-40"}`}
        >
          Payment
        </button>
        <span>–</span>
        <button
          onClick={() => step === "confirmation" && setStep("confirmation")}
          disabled={step !== "confirmation"}
          className={`transition ${step === "confirmation" ? "text-black font-semibold" : "text-gray-400 cursor-not-allowed opacity-40"}`}
        >
          Confirmation
        </button>
      </div>

      {/* Render current step */}
      <div>{renderStep()}</div>
    </div>
  );
};

export default CartPage;
