"use client";

import React from "react";
import { CheckCircle, BookOpen, X, MailOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export interface PurchaseDetails {
  bookTitle: string;
  amount: string; 
  date: string;
  email: string;
  reference: string;
}

interface ConfirmationProps {
  details: PurchaseDetails; 
}

const Confirmation: React.FC<ConfirmationProps> = ({ details }) => {
  const router = useRouter();

  const handleClose = () => {
    router.push("/dashboard/profile");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative p-8 md:p-12"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={24} className="text-slate-400" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-green-100 p-4 rounded-full mb-6"
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Payment Confirmed!
          </h2>
          
          {/* Informative webhook email fulfillment notice banner */}
          <div className="bg-sky-50 border border-sky-100 text-sky-800 rounded-2xl px-4 py-3 text-sm flex items-center gap-3 max-w-md mb-8 mt-2 text-left">
            <MailOpen size={24} className="text-sky-600 shrink-0" />
            <p>
              Your single-use download access key has been successfully generated and dispatched to <span className="font-bold text-slate-900">{details.email}</span>.
            </p>
          </div>

          {/* Transaction Summary Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full text-left">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#035b77] mb-6 flex items-center gap-2">
              <BookOpen size={18} /> Order Footprint
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 text-sm">Item</span>
                <span className="font-bold text-slate-900 text-sm text-right max-w-[200px]">
                  {details.bookTitle}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">{details.date}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-[10px] text-sky-700 bg-sky-100/50 px-2 py-1 rounded">
                  {details.reference}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Account</span>
                <span className="font-medium text-slate-900">{details.email}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Paid</span>
                <span className="font-black text-green-600 text-xl">
                  ${details.amount}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleClose} 
            className="w-full mt-8 bg-[#035b77] text-white py-4 rounded-xl font-bold transition-all hover:bg-[#02495f]"
          >
            Go to My Profile Library
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Confirmation;
/*
"use client";

import React from "react";
import { CheckCircle, BookOpen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { REST_API } from "../../../constant";

export interface PurchaseDetails {
  bookTitle: string;
  amount: string; 
  date: string;
  email: string;
  reference: string;
}

interface ConfirmationProps {
  details: PurchaseDetails; 
}

const Confirmation: React.FC<ConfirmationProps> = ({ details }) => {
  const router = useRouter();

  
  const handleClose = () => {
    router.push("/dashboard/profile");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative p-8 md:p-12"
      >
        
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={24} className="text-slate-400" />
        </button>

        <div className="flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-green-100 p-4 rounded-full mb-6"
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-slate-500 mb-10 text-base">
            Your transaction was successful. You can find your new content in your library.
          </p>

          
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full text-left">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#035b77] mb-6 flex items-center gap-2">
              <BookOpen size={18} /> Transaction Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 text-sm">Item</span>
                <span className="font-bold text-slate-900 text-sm text-right max-w-[200px]">
                  {details.bookTitle}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">{details.date}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-[10px] text-sky-700 bg-sky-100/50 px-2 py-1 rounded">
                  {details.reference}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Account</span>
                <span className="font-medium text-slate-900">{details.email}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Paid</span>
                <span className="font-black text-green-600 text-xl">
                  ${details.amount}
                </span>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-xs text-slate-400">
            A confirmation receipt has been sent to your email. 
            Connect to <span className="text-[#035b77]">{REST_API}</span> for support.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Confirmation;
*/