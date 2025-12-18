"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Download, Search, Grid, CheckCircle, ArrowDownCircle } from "lucide-react";

// Animation Variants
const fadeIn = (delay = 0, y = 30) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

export default function BriTextLandingPage() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900">

      {/* ================= HERO SECTION ================= */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full h-[80vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-sky-100 to-white"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
        >
          Discover. Learn. Grow.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl max-w-2xl"
        >
          Your Digital Library for Every Book You Desire — Educational,
          Fictional, Faith-based, Professional & Lifestyle.
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

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-20 bg-gray-50">
        <motion.h2 {...fadeIn(0)} className="text-3xl font-bold text-center mb-12">
          Why Choose BriText?
        </motion.h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          {[
            { title: "Massive Book Collection", text: "Access thousands of books across genres — from academics to self-development.", icon: <BookOpen size={40} className="mx-auto text-sky-600 mb-4" /> },
            { title: "Instant Download", text: "Get your desired books immediately with a seamless, reliable download system.", icon: <Download size={40} className="mx-auto text-sky-600 mb-4" /> },
            { title: "Smart & Easy Search", text: "Find exactly what you're looking for using our advanced search and category filters.", icon: <Search size={40} className="mx-auto text-sky-600 mb-4" /> },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="p-8 bg-white rounded-2xl shadow-lg text-center hover:shadow-xl transition"
            >
              {item.icon}
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
              <p className="text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 bg-gray-100">
        <motion.h2 {...fadeIn(0)} className="text-3xl font-bold text-center mb-12">
          How It Works
        </motion.h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          {[
            { title: "Browse & Search", text: "Explore categories or quickly find any book using smart search.", icon: <Grid size={40} className="mx-auto text-sky-600 mb-4" /> },
            { title: "Choose Your Book", text: "Select from thousands of educational, technical, lifestyle, and faith-based titles.", icon: <CheckCircle size={40} className="mx-auto text-sky-600 mb-4" /> },
            { title: "Download Instantly", text: "Get immediate access to your digital copy — anytime, anywhere.", icon: <ArrowDownCircle size={40} className="mx-auto text-sky-600 mb-4" /> },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="p-8 bg-white rounded-2xl shadow-lg text-center hover:shadow-xl transition"
            >
              {item.icon}
              <h3 className="text-xl font-semibold mt-4 mb-3 text-gray-900">{item.title}</h3>
              <p className="text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
