"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

const SubscribeSection = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmail("");
  };

  return (
    <section className="relative overflow-hidden py-20 px-6 md:px-10 bg-gradient-to-r from-sky-600 via-white-600 to-gray-500 text-white rounded-3xl mx-4 md:mx-10 my-10">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 opacity-20">
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
          Stay in the Loop with BriText ✨
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/90 text-sm md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto"
        >
          Subscribe to our newsletter and be the first to know about new arrivals, special discounts,
          exclusive author stories, and tips for smarter reading.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={handleSubscribe}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full sm:w-[380px] px-5 py-3 rounded-full text-gray-800 placeholder-gray-100 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold hover:bg-indigo-100 transition-all duration-300 shadow-lg"
          >
            <Send className="w-5 h-5" />
            Subscribe
          </button>
        </motion.form>

        {/* Success message */}
        {subscribed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 text-green-100 font-medium"
          >
         You’re all set! We’ll keep you updated.
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SubscribeSection;