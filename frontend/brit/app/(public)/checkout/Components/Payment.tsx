"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FaPaypal, FaCcVisa, FaCcMastercard } from "react-icons/fa";

export type CartItem = {
  _id: string;
  book: {
    _id: string;
    title: string;
    category: string;
    price: number;
  };
};

interface PaymentProps {
  cartItems: CartItem[];
  onNext: () => void;
  onBack: () => void;
}

const Payment: React.FC<PaymentProps> = ({
  cartItems,
  onNext,
  onBack,
}) => {
  const [method, setMethod] = useState<"paypal" | "credit">("credit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.book.price,
    0
  );

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // 🔹 TEMP: simulate payment request
      await new Promise((res) => setTimeout(res, 2000));

      onNext();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Checkout
        </h1>

        <button
          onClick={onBack}
          className="flex items-center text-sm text-[#035b77] hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Go Back
        </button>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-10">
        <span>My Cart</span>
        <span>–</span>
        <span className="font-semibold text-black">Payment</span>
        <span>–</span>
        <span>Confirmation</span>
      </div>

      {/* Order Summary */}
      <div className="border rounded-2xl p-5 mb-10">
        <h2 className="font-semibold mb-4">Order Summary</h2>

        <div className="space-y-3 text-sm">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex justify-between"
            >
              <span>{item.book.title}</span>
              <span>₦{item.book.price.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 text-lg font-semibold">
          <span>Total</span>
          <span>₦{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Method */}
      <h2 className="text-lg font-semibold mb-6">
        Choose your preferred payment method
      </h2>

      <div className="space-y-5">
        {/* PayPal */}
        <div
          onClick={() => setMethod("paypal")}
          className={`border rounded-2xl p-5 flex justify-between items-center cursor-pointer transition ${
            method === "paypal"
              ? "border-[#035b77] bg-[#f7fbfc]"
              : "border-gray-200"
          }`}
        >
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <input
                type="radio"
                checked={method === "paypal"}
                readOnly
                className="accent-[#035b77]"
              />
              Paypal
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Safe online payment. No PayPal account required.
            </p>
          </div>
          <FaPaypal size={40} className="text-[#003087]" />
        </div>

        {/* Credit Card */}
        <div
          onClick={() => setMethod("credit")}
          className={`border rounded-2xl p-5 cursor-pointer transition ${
            method === "credit"
              ? "border-[#035b77] bg-[#f7fbfc]"
              : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <input
                  type="radio"
                  checked={method === "credit"}
                  readOnly
                  className="accent-[#035b77]"
                />
                Credit Card
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Visa, MasterCard or Verve supported.
              </p>
            </div>
            <div className="flex gap-2">
              <FaCcVisa size={40} className="text-[#1A1F71]" />
              <FaCcMastercard size={40} className="text-[#EB001B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 mt-6">{error}</p>}

      {/* Pay Button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`bg-[#035b77] text-white px-8 py-3 rounded-full font-semibold transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#02485d]"
          }`}
        >
          {loading ? "Processing..." : "Pay Now →"}
        </button>
      </div>
    </div>
  );
};

export default Payment;
