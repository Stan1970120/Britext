"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FaPaypal, FaCcVisa, FaCcMastercard } from "react-icons/fa";

interface PaymentProps {
  onNext?: () => void;
  onBack?: () => void;
}

const Payment: React.FC<PaymentProps> = ({ onNext, onBack }) => {
  const [method, setMethod] = useState<"paypal" | "credit">("credit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handlePayment = async () => {
  setLoading(true);
  setError("");

  try {
    // Simulate API call
    await new Promise((res) => setTimeout(res, 2000));

    if (onNext) onNext();
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Payment failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
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

      {/* Payment Method */}
      <h2 className="text-lg font-semibold mb-6">
        Choose your preferred payment method
      </h2>

      <div className="space-y-5">
        <div
          className={`border rounded-2xl p-5 flex justify-between items-center cursor-pointer transition ${
            method === "paypal"
              ? "border-[#035b77] bg-[#f7fbfc]"
              : "border-gray-200"
          }`}
          onClick={() => setMethod("paypal")}
        >
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <input type="radio" checked={method === "paypal"} readOnly className="accent-[#035b77]" />
              Paypal
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Safe payment online. Credit card needed. Paypal account is not necessary.
            </p>
          </div>
          <FaPaypal size={40} className="text-[#003087]" />
        </div>

        <div
          className={`border rounded-2xl p-5 cursor-pointer transition ${
            method === "credit"
              ? "border-[#035b77] bg-[#f7fbfc]"
              : "border-gray-200"
          }`}
          onClick={() => setMethod("credit")}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <input type="radio" checked={method === "credit"} readOnly className="accent-[#035b77]" />
                Credit Card
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Safe money transfer using your bank account. Visa, MasterCard or Verve.
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <FaCcVisa size={40} className="text-[#1A1F71]" />
              <FaCcMastercard size={40} className="text-[#EB001B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-red-600 mt-4">{error}</p>}

      {/* Pay Button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`bg-[#035b77] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#02485d] transition flex items-center justify-center ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Pay Now →"}
        </button>
      </div>
    </div>
  );
};

export default Payment;
