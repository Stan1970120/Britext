"use client";

import React, { useState } from "react";
import { CheckCircle, X, AlertTriangle, BookOpen, Download, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../../../constant/api";

interface PurchaseDetails {
  bookTitle: string;
  amount: string;
  date: string;
  email: string;
  reference: string;
}

interface ConfirmationProps {
  onBack: () => void;
  details?: PurchaseDetails; // Data passed after successful Paystack verification
}

const Confirmation: React.FC<ConfirmationProps> = ({ onBack, details }) => {
  const [downloading, setDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();

  // Handle Book Download from the official API
  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await fetch(API.READER_VIEW(details?.reference || "download"), {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to download book");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${details?.bookTitle || "YourBook"}.pdf`;
      link.click();

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Download failed:", error);
      setShowErrorModal(true);
    } finally {
      setDownloading(false);
    }
  };

  const handleGoToLibrary = () => {
    router.push("/dashboard/my-books");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[#f8fafc] text-center relative">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-green-100 p-4 rounded-full mb-4"
      >
        <CheckCircle size={50} className="text-green-600" />
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Your transaction was verified. The book has been added to your personal library and a receipt has been sent to your email.
      </p>

      {/* Details Card */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 p-8 w-full max-w-xl text-left">
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          <BookOpen size={20} className="text-sky-600" /> Order Summary
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span>Book Title:</span>
            <span className="font-semibold text-gray-900">{details?.bookTitle || "Build Your Family Bank"}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span>Transaction Date:</span>
            <span className="font-medium">{details?.date || new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span>Reference:</span>
            <span className="font-mono text-xs text-sky-600 uppercase">{details?.reference || "PAY-REF-XYZ"}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span>Customer Email:</span>
            <span className="font-medium">{details?.email || "User@example.com"}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-bold text-gray-900">Total Paid:</span>
            <span className="font-bold text-green-600">₦{details?.amount || "30"}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <button
          onClick={handleGoToLibrary}
          className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-white bg-[#035b77] hover:bg-[#02485d] transition shadow-lg shadow-sky-900/20"
        >
          <BookOpen size={20} /> Go to My Books
        </button>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-[#035b77] bg-white border-2 border-[#035b77] hover:bg-sky-50 transition"
        >
          {downloading ? "Processing..." : <><Download size={20} /> Download PDF</>}
        </button>
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-sm font-medium text-gray-400 hover:text-sky-600 transition"
      >
        ← Return to Store
      </button>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center relative"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Enjoy your read!</h2>
              <p className="text-gray-500 mb-8">
                Your book has been saved to your device and is permanently available in your library.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoToLibrary}
                  className="bg-[#035b77] text-white py-3 rounded-xl font-bold hover:bg-[#02485d] transition"
                >
                  View My Library
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center gap-2 text-gray-500 py-2 font-semibold hover:text-gray-800 transition"
                >
                  <Home size={18} /> Back to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-sm text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-500 mb-6">We couldn&apos;t process the download. Please try again from your dashboard later.</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Confirmation;