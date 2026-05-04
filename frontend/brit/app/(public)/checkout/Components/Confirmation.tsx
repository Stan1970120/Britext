"use client";

import React from "react";
import { CheckCircle, BookOpen, X, Home, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { REST_API } from "../../../constant";

// Defining the shape of data passed after successful payment
export interface PurchaseDetails {
  bookTitle: string;
  amount: string; // The formatted amount from Paystack (e.g., "30.00")
  date: string;
  email: string;
  reference: string;
}

interface ConfirmationProps {
  details?: PurchaseDetails; 
}

const Confirmation: React.FC<ConfirmationProps> = ({ details }) => {
  const router = useRouter();

  // Primary action: send to user's library
  const handleGoToLibrary = () => {
    router.push("/dashboard/my-books");
  };

  // secondary action: send to main homepage
  const handleGoHome = () => {
    router.push("/");
  };

  // Close functionality as requested, routing to profile
  const handleClose = () => {
    router.push("/dashboard/profile");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[#f8fafc] text-center relative">
      
      {/* Absolute positioned close button (X) */}
      <button 
        onClick={handleClose}
        className="absolute top-10 right-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close and return to profile"
      >
        <X size={28} className="text-gray-400" />
      </button>

      {/* Success Icon Animation (image_3.png flow) */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="bg-green-100 p-5 rounded-full mb-6"
      >
        <CheckCircle size={60} className="text-green-600" />
      </motion.div>

      <h2 className="text-4xl font-black text-gray-900 mb-3">
        Payment Successful!
      </h2>
      <p className="text-gray-500 mb-12 max-w-lg text-lg">
        Thank you for your purchase. Your book has been added to your personal library and a receipt has been sent to your email.
      </p>

      {/* Details Summary Card (image_3.png style) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 p-8 w-full max-w-xl text-left mb-10"
      >
        <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-4">
          <BookOpen size={20} className="text-[#035b77]" /> Transaction Summary
        </h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Item:</span>
            <span className="font-semibold text-gray-900 line-clamp-1 flex-1 text-right ml-4">
              {details?.bookTitle || "Digital E-Book"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Date:</span>
            <span className="font-medium text-gray-900">
              {details?.date || new Date().toLocaleDateString('en-CA')} 
              {/* Uses API or current date in readable format */}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Reference:</span>
            <span className="font-mono text-xs text-sky-600 uppercase bg-sky-50 px-2.5 py-1.5 rounded-lg">
              {details?.reference || "PAY-REF-XYZ"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Account:</span>
            <span className="font-medium text-gray-900">
              {details?.email || "User@example.com"}
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-5">
            <span className="font-bold text-gray-900 text-base">Amount Paid:</span>
            {/* Standardized to USD ($) as requested */}
            <span className="font-bold text-green-600 text-xl">
              ${details?.amount || "30.00"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Simplified Actions (Based on image_3.png logic but styled as buttons) */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleGoToLibrary}
          className="flex items-center justify-center gap-3 bg-[#035b77] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#02485d] transition shadow-lg shadow-sky-900/20"
        >
          <Library size={22} /> Go to My Books
        </button>
        
        <button
          onClick={handleGoHome}
          className="flex items-center justify-center gap-2 text-gray-500 font-semibold py-2 hover:text-[#035b77] transition"
        >
          <Home size={18} /> Return to Home
        </button>
      </div>

    </div>
  );
};

export default Confirmation;