"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { REST_API } from "../app/constant"; 

const SubscribeSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // Using REST_API directly with the endpoint string
      const res = await fetch(`${REST_API}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ 
          type: "success", 
          message: "You’re all set! We’ll keep you updated. ✨" 
        });
        setEmail("");
        setTimeout(() => setStatus({ type: null, message: "" }), 5000);
      } else {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to subscribe.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 px-6 md:px-10 bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 text-white rounded-3xl mx-4 md:mx-10 my-10">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl top-10 left-20 animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-white rounded-full blur-3xl bottom-0 right-10 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          Stay in the Loop with EnjoyReads
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/90 text-sm md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto"
        >
          Subscribe to our newsletter and be the first to know about new arrivals, special discounts,
          and exclusive stories.
        </motion.p>

        <motion.form
          onSubmit={handleSubscribe}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <div className="relative w-full sm:w-[380px]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email address"
              className="w-full px-6 py-3.5 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg disabled:bg-gray-100 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-sky-700 font-bold hover:bg-sky-50 transition-all duration-300 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </motion.form>

        <AnimatePresence mode="wait">
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 flex items-center justify-center gap-2 font-medium ${
                status.type === "success" ? "text-sky-100" : "text-red-200"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SubscribeSection;