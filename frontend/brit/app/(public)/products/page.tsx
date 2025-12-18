"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans">

      {/* ================= HERO SECTION ================= */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-sky-100 to-white"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
        >
          Explore BriText Products
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl max-w-2xl text-gray-700"
        >
          Discover our digital products designed to make learning easier, faster, and more fun. 
          Educational, lifestyle, technical, and professional resources — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link href="/book-store">
            <button className="mt-6 px-8 py-3 bg-sky-600 text-white rounded-2xl shadow-md hover:bg-sky-700 transition-all cursor-pointer">
              Explore Library
            </button>
          </Link>
        </motion.div>
      </motion.section>

      {/* ================= COMING SOON ================= */}
      <section className="py-20 bg-gray-90">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center px-6"
        >
          <Clock size={60} className="mx-auto text-sky-600 mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Exciting Products Coming Soon!
          </h2>
          <p className="text-gray-700 mb-6">
            We’re working hard to bring you more digital resources to make your learning journey seamless. Stay tuned for our upcoming releases.
          </p>
          <Link href="/book-store">
            <button className="px-6 py-3 bg-sky-600 text-white rounded-2xl shadow-md hover:bg-sky-700 transition-all">
              Check Here
            </button>
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
