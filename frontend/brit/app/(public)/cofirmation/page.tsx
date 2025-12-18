"use client";

import React, { useState } from "react";
import { CheckCircle, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationProps {
  onBack: () => void; // Optional: to return to cart or home
}

const Confirmation: React.FC<ConfirmationProps> = ({ onBack }) => {
  const [downloading, setDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Example backend endpoint for the book download
      const response = await fetch(`"https://your-backend-url.com/api/books/download"`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download book");
      }

      // Convert to blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      const link = document.createElement("a");
      link.href = url;
      link.download = "YourBook.pdf";
      link.click();

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Download failed:", error);
      // Show error modal instead of alert
      setShowErrorModal(true);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenBook = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-white text-center relative">
      {/* Success Icon */}
      <CheckCircle size={60} className="text-green-600 mb-4" />

      {/* Success Message */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Payment Successful!
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Your payment has been confirmed. You will also receive an email with
        your details and a link to download your book.
      </p>

      {/* Details Card */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-10 w-full max-w-xl text-left">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Book Details
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Book:</span>
            <span>Build Your Family Bank</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>20th July, 2025</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>Credit Card</span>
          </div>
        </div>

        <hr className="my-5" />

        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          👤 Customer Details
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Email:</span>
            <span>harzfart233@gmail.com</span>
          </div>
          <div className="flex justify-between">
            <span>Phone number:</span>
            <span>09131852868</span>
          </div>
          <div className="flex justify-between">
            <span>Payment:</span>
            <span>Visa Credit Card</span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`mt-10 px-8 py-3 rounded-full font-semibold text-white transition ${
          downloading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#035b77] hover:bg-[#02485d]"
        }`}
      >
        {downloading ? "Downloading..." : "📥 Download Book"}
      </button>

      {/* Optional Return Link */}
      <button
        onClick={onBack}
        className="mt-6 text-sm text-[#035b77] hover:underline"
      >
        ← Return to My Cart
      </button>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md text-center relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowSuccessModal(false)}
              >
                <X size={20} />
              </button>

              <CheckCircle size={50} className="text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Download Complete
              </h2>
              <p className="text-gray-600 mb-6">
                Your book has been downloaded successfully.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleOpenBook}
                  className="bg-[#035b77] text-white py-2 rounded-full font-medium hover:bg-[#02485d] transition"
                >
                  📖 Open Book
                </button>
                <button
                  onClick={handleGoHome}
                  className="border border-[#035b77] text-[#035b77] py-2 rounded-full font-medium hover:bg-[#035b77] hover:text-white transition"
                >
                  🏠 Go Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❌ Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md text-center relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowErrorModal(false)}
              >
                <X size={20} />
              </button>

              <AlertTriangle size={50} className="text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Download Failed
              </h2>
              <p className="text-gray-600 mb-6">
                Unable to download the book. Please check your network connection.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="bg-[#035b77] text-white px-6 py-2 rounded-full font-medium hover:bg-[#02485d] transition"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Confirmation;