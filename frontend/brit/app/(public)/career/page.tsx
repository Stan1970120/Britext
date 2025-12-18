"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Briefcase, Users } from "lucide-react";

const fadeIn = (delay = 0, y = 30) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const staggerParent = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.25 } },
  viewport: { once: true },
};

const staggerChild = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  viewport: { once: true },
};

export default function CareerPage() {
  const readerCategories = [
    { title: "Students", icon: <GraduationCap size={48} className="text-sky-600 mx-auto mb-4" /> },
    { title: "Researchers", icon: <BookOpen size={48} className="text-sky-600 mx-auto mb-4" /> },
    { title: "Professionals", icon: <Briefcase size={48} className="text-sky-600 mx-auto mb-4" /> },
    { title: "Lifelong Learners", icon: <Users size={48} className="text-sky-600 mx-auto mb-4" /> },
  ];

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
          Build Your Career With BriText
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl max-w-2xl text-gray-700"
        >
          Explore thousands of books, research papers, and professional resources designed 
          to help you grow, learn, and excel in your career.
        </motion.p>
      </motion.section>

      {/* ================= HOW BRTEXT HELPS ================= */}
      <section className="py-20">
        <motion.h2 {...fadeIn(0)} className="text-3xl font-bold text-center mb-12">
          How BriText Helps Your Career
        </motion.h2>

        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="whileInView"
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6"
        >
          {[
            {
              title: "Build Knowledge",
              text: "Access curated educational books, technical manuals, and skill-building resources to strengthen your foundation.",
            },
            {
              title: "Improve Skills",
              text: "Gain insights from research papers, journals, and professional guides to stay ahead in your field.",
            },
            {
              title: "Stay Updated",
              text: "Stay current with the latest industry trends and developments to boost your career growth.",
            },
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerChild} className="p-8 bg-white rounded-2xl shadow-md text-center">
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/*  CATEGORIES OF READERS  */}
      <section className="py-20 bg-gray-50">
        <motion.h2 {...fadeIn(0)} className="text-3xl font-bold text-center mb-12">
          Who Can Benefit From BriText
        </motion.h2>

        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="whileInView"
          className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 px-6"
        >
          {readerCategories.map((category, idx) => (
            <motion.div key={idx} variants={staggerChild} className="p-8 bg-white rounded-2xl shadow-md text-center">
              {category.icon}
              <h3 className="text-xl font-semibold">{category.title}</h3>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/*  ADDITIONAL BENEFITS  */}
      <section className="py-20">
        <motion.h2 {...fadeIn(0)} className="text-3xl font-bold text-center mb-12">
          Additional Benefits
        </motion.h2>

        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="whileInView"
          className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 px-6"
        >
          {[
            {
              title: "Flexible Learning",
              text: "Read at your own pace, anytime, anywhere, and revisit content whenever needed.",
            },
            {
              title: "Boost Productivity",
              text: "Enhance your professional efficiency with targeted guides and insightful knowledge.",
            },
          ].map((item, idx) => (
            <motion.div key={idx} variants={staggerChild} className="p-8 bg-white rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
