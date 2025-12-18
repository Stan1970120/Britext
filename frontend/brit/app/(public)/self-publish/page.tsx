"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SelfPublishPage() {
  const router = useRouter();

  const fadeInUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
    viewport: { once: true },
  });

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans flex flex-col">

      {/* ================= HERO SECTION ================= */}
      <motion.section
        {...fadeInUp(0)}
        className="w-full h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-r from-sky-200 via-white to-sky-100"
      >
        <BookOpen className="w-16 h-16 text-sky-600 mb-4 animate-bounce" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
        >
          Self Publish With BriText
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-700 text-lg md:text-xl max-w-2xl"
        >
          This feature is coming soon. You’ll soon be able to self-publish your books and reach thousands of readers worldwide.
        </motion.p>
      </motion.section>

      {/* ================= COMING SOON CARD ================= */}
      <motion.div
        {...fadeInUp(0.2)}
        className="max-w-md mx-auto mt-12 bg-white shadow-lg rounded-2xl p-10 text-center flex flex-col items-center gap-6"
      >
        <BookOpen className="w-12 h-12 text-sky-600 animate-pulse" />
        <h2 className="text-2xl font-bold">Coming Soon</h2>
        <p className="text-gray-600">
          The self-publishing platform is under development. Stay tuned!
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-3 bg-sky-600 text-white rounded-2xl hover:bg-sky-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Go Back
        </button>
      </motion.div>
    </div>
  );
}
