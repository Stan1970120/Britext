"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MailX, Home, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function UnsubscribeSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-sky-100 rounded-full scale-150 blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-full border-2 border-sky-100">
              <MailX size={48} className="text-sky-600" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Successfully Unsubscribed
        </h1>
        
        <div className="flex items-center justify-center gap-2 text-green-600 font-medium mb-6">
          <CheckCircle2 size={18} />
          <span>You&apos;ve been removed from our list</span>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          We&apos;re sorry to see you go! You will no longer receive updates, 
          new arrival alerts, or exclusive offers from <strong>EnjoyReads</strong>.
        </p>

        <div className="space-y-3">
          <Link 
            href="/book-store" 
            className="flex items-center justify-center gap-2 w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors shadow-md shadow-sky-100"
          >
            <ShoppingBag size={18} />
            Back to Store
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Unsubscribed by mistake? Just head back to our home page and 
          re-enter your email in the subscription section.
        </p>
      </motion.div>
    </div>
  );
}