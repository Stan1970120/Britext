"use client";

import React, { useState } from "react";
import { ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { usePaystackPayment } from "react-paystack";
import { REST_API } from "../../../constant";
import { CartItem } from "../page";
import { PurchaseDetails } from "./Confirmation";

interface PaystackSuccessResponse {
  reference: string;
  trxref?: string;
  status: string;
  message: string;
  transaction: string;
}

interface PaymentProps {
  cartItems: CartItem[];
  onNext: (details: PurchaseDetails) => void;
  onBack: () => void;
  userEmail: string;
}

interface PaystackCustomMetadata {
  custom_fields: Array<{ display_name: string; variable_name: string; value: string }>;
  bookIds: string[];
  userId: string | null;
}

interface PaystackHookConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
  currency: string;
  metadata: PaystackCustomMetadata;
}

type PaymentGateway = "paystack" | "stripe";

const Payment: React.FC<PaymentProps> = ({
  cartItems,
  onNext,
  onBack,
  userEmail,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>("paystack");

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.book?.price || 0) * item.quantity,
    0
  );

  // === PAYSTACK VERIFICATION ROUTINE ===
  const verifyAndCompletePaystack = async (reference: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${REST_API}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          reference,
          bookIds: cartItems.map((item) => item.bookId),
          expectedAmount: totalAmount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onNext({
          bookTitle: cartItems.length > 1 
            ? "Multiple Books" 
            : (cartItems[0]?.book?.title || "Digital E-Book"),
          amount: totalAmount.toFixed(2),
          date: new Date().toLocaleDateString('en-CA'),
          email: userEmail || "customer@example.com",
          reference: reference,
        });
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`${errorMessage}. Please contact support.`);
    } finally {
      setLoading(false);
    }
  };

  const onPaystackSuccess = (response: PaystackSuccessResponse) => {
    const reference = response.reference || response.trxref;
    if (reference) {
      verifyAndCompletePaystack(reference);
    } else {
      setError("Payment reference not found.");
    }
  };

  const onPaystackClose = () => {
    setError("Payment window closed.");
  };

  const paystackConfig: PaystackHookConfig = {
    reference: `REF-${new Date().getTime()}`,
    email: userEmail || "customer@example.com",
    amount: Math.round(totalAmount * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key",
    currency: "USD",
    metadata: {
      custom_fields: [], 
      bookIds: cartItems.map((item) => item.bookId),
      userId: localStorage.getItem("token") 
        ? (JSON.parse(atob(localStorage.getItem("token")!.split('.')[1])).id as string)
        : null
    }
  };

  const initializePaystackPayment = usePaystackPayment(paystackConfig);

  // === STRIPE FLOW INITIALIZATION ===
  const handleStripeCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${REST_API}/payments/create-stripe-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          bookIds: cartItems.map((item) => item.bookId),
          email: userEmail || "customer@example.com",
        }),
      });

      const session = await response.json();

      if (response.ok && session.url) {
        // Redirect browser to secure Stripe hosted checkout platform
        window.location.href = session.url;
      } else {
        throw new Error(session.message || "Stripe session construction dropped.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Stripe connection failed.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePaymentExecution = () => {
    setError("");
    if (selectedGateway === "paystack") {
      initializePaystackPayment({ onSuccess: onPaystackSuccess, onClose: onPaystackClose });
    } else if (selectedGateway === "stripe") {
      handleStripeCheckout();
    }
  };

  return (
    <div className="bg-white py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
        <button
          onClick={onBack}
          className="flex items-center text-sm font-bold text-[#035b77] hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-4">
          
          {/* PAYSTACK SELECTOR OPTION */}
          <div 
            onClick={() => setSelectedGateway("paystack")}
            className={`border-2 rounded-2xl p-6 flex justify-between items-center cursor-pointer transition-all ${
              selectedGateway === "paystack" ? "border-[#035b77] bg-sky-50/30" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <input 
                type="radio" 
                checked={selectedGateway === "paystack"} 
                readOnly 
                className="accent-[#035b77] h-4 w-4"
              />
              <div className="bg-[#035b77] p-2 rounded-lg text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Paystack Secure Checkout</h3>
                <p className="text-xs text-gray-500">Pay via Card, Apple Pay, or Bank Transfer</p>
              </div>
            </div>
            <div className="flex gap-2">
              <FaCcVisa size={28} className="text-[#1A1F71]" />
              <FaCcMastercard size={28} className="text-[#EB001B]" />
            </div>
          </div>

          {/* STRIPE SELECTOR OPTION */}
          <div 
            onClick={() => setSelectedGateway("stripe")}
            className={`border-2 rounded-2xl p-6 flex justify-between items-center cursor-pointer transition-all ${
              selectedGateway === "stripe" ? "border-indigo-600 bg-indigo-50/10" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <input 
                type="radio" 
                checked={selectedGateway === "stripe"} 
                readOnly 
                className="accent-indigo-600 h-4 w-4"
              />
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Stripe Global Gateway</h3>
                <p className="text-xs text-gray-500">Secure international credit card processing</p>
              </div>
            </div>
            <div className="text-xs font-black tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-md">
              Stripe
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 leading-relaxed">
              Payments are fully encrypted. Your raw card identifiers never parse through our application storage layers.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Summary</h3>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.bookId} className="flex justify-between text-sm">
                  <span className="text-slate-600 line-clamp-1 flex-1">{item.book?.title}</span>
                  <span className="font-bold text-slate-900 ml-4">
                    ${((item.book?.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Amount</span>
              <span className="text-xl font-black text-[#035b77]">${totalAmount.toLocaleString()}</span>
            </div>
            
            <button
              onClick={handlePaymentExecution}
              disabled={loading}
              className={`w-full mt-8 text-white py-4 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 ${
                selectedGateway === "stripe" ? "bg-indigo-600 shadow-indigo-100" : "bg-[#035b77] shadow-sky-100"
              }`}
            >
              {loading ? "Initializing Secure Session..." : `Pay $${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
/*
"use client";

import React, { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { usePaystackPayment } from "react-paystack";
import { REST_API } from "../../../constant";
import { CartItem } from "../page";
import { PurchaseDetails } from "./Confirmation";

interface PaystackSuccessResponse {
  reference: string;
  trxref?: string;
  status: string;
  message: string;
  transaction: string;
}

interface PaymentProps {
  cartItems: CartItem[];
  onNext: (details: PurchaseDetails) => void;
  onBack: () => void;
  userEmail: string;
}

const Payment: React.FC<PaymentProps> = ({
  cartItems,
  onNext,
  onBack,
  userEmail,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.book?.price || 0) * item.quantity,
    0
  );

  const verifyAndComplete = async (reference: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${REST_API}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          reference,
          bookIds: cartItems.map((item) => item.bookId),
          expectedAmount: totalAmount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onNext({
          bookTitle: cartItems.length > 1 
            ? "Multiple Books" 
            : (cartItems[0]?.book?.title || "Digital E-Book"),
          amount: totalAmount.toFixed(2),
          date: new Date().toLocaleDateString('en-CA'),
          email: userEmail || "customer@example.com",
          reference: reference,
        });
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`${errorMessage}. Please contact support.`);
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = (response: PaystackSuccessResponse) => {
    const reference = response.reference || response.trxref;
    if (reference) {
      verifyAndComplete(reference);
    } else {
      setError("Payment reference not found.");
    }
  };

  const onClose = () => {
    setError("Payment window closed.");
  };

  const config = {
    reference: `REF-${new Date().getTime()}`,
    email: userEmail || "customer@example.com",
    amount: Math.round(totalAmount * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key",
    currency: "USD",
  };

  // Directives removed as the types are now resolving correctly
  const initializePayment = usePaystackPayment(config);

  return (
    <div className="bg-white py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
        <button
          onClick={onBack}
          className="flex items-center text-sm font-bold text-[#035b77] hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-5">
          <div className="border-2 border-[#035b77] bg-sky-50/30 rounded-2xl p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-[#035b77] p-2 rounded-lg">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Paystack Secure Checkout</h3>
                <p className="text-xs text-gray-500">Pay via Card, Apple Pay, or Bank Transfer</p>
              </div>
            </div>
            <div className="flex gap-2">
              <FaCcVisa size={28} className="text-[#1A1F71]" />
              <FaCcMastercard size={28} className="text-[#EB001B]" />
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 leading-relaxed">
              Your payment is processed securely through Paystack. Brit Academy does not store your card details.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Summary</h3>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.bookId} className="flex justify-between text-sm">
                  <span className="text-slate-600 line-clamp-1 flex-1">{item.book?.title}</span>
                  <span className="font-bold text-slate-900 ml-4">
                    ${((item.book?.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Amount</span>
              <span className="text-xl font-black text-[#035b77]">${totalAmount.toLocaleString()}</span>
            </div>
            
            <button
              onClick={() => {
                setError("");
                initializePayment({ onSuccess, onClose });
              }}
              disabled={loading}
              className="w-full mt-8 bg-[#035b77] text-white py-4 rounded-xl font-bold shadow-lg shadow-sky-100 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Verifying..." : `Pay $${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;


/*
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

      
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-10">
        <span>My Cart</span>
        <span>–</span>
        <span className="font-semibold text-black">Payment</span>
        <span>–</span>
        <span>Confirmation</span>
      </div>

      
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

      
      <h2 className="text-lg font-semibold mb-6">
        Choose your preferred payment method
      </h2>

      <div className="space-y-5">
        
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

      
      {error && <p className="text-red-600 mt-6">{error}</p>}

      
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
*/
