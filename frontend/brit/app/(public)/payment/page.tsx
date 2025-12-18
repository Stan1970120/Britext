"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FaPaypal, FaCcVisa, FaCcMastercard } from "react-icons/fa";

// Define the prop types
interface PaymentProps {
  onNext?: () => void;
  onBack?: () => void;
}

const Payment: React.FC<PaymentProps> = ({ onBack }) => {
  const [method, setMethod] = useState<"paypal" | "credit">("credit");

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

      {/* Payment Method Section */}
      <h2 className="text-lg font-semibold mb-6">
        Choose your preferred payment method
      </h2>

      <div className="space-y-5">
        {/* Paypal */}
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
              <input
                type="radio"
                checked={method === "paypal"}
                readOnly
                className="accent-[#035b77]"
              />
              Paypal
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Safe payment online. Credit card needed.
              <br />
              Paypal account is not necessary.
            </p>
          </div>
          <FaPaypal size={40} className="text-[#003087]" />
        </div>

        {/* Credit Card */}
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
                <input
                  type="radio"
                  checked={method === "credit"}
                  readOnly
                  className="accent-[#035b77]"
                />
                Credit Card
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Safe money transfer using your bank account. Visa, MasterCard or
                Verve.
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <FaCcVisa size={40} className="text-[#1A1F71]" />
              <FaCcMastercard size={40} className="text-[#EB001B]" />
            </div>
          </div>
        </div>
      </div>

     {/* Pay Button */}
<div className="mt-10 flex justify-end">
  <button
    onClick={() => window.location.href = "/cofirmation"} // <-- correct path
    className="bg-[#035b77] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#02485d] transition"
  >
    Pay Now →
  </button>
</div>


      
      
    </div>
  );
};
export default Payment;