"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

// ✅ Reusable fade-up variant
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.2, // each item staggered
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

const AboutAuthor = () => {
  const reviews = [
    "Start high so there’s room to concede while still getting a good deal.",
    "The first offer is often not the best — they expect you to negotiate.",
    "Show visible surprise or discomfort to make the other party question their offer.",
  ];

  const bookDetails = [
    { label: "Name", value: "The Secret of Power Negotiating" },
    { label: "Author", value: "Roger Dawson" },
    { label: "Publisher", value: "Career Press/Weiser Books" },
    { label: "First Edition", value: "Hardcover 2019" },
    { label: "Publication Year", value: "September 28, 2020" },
    { label: "Second Edition", value: "October 20, 2010 (Paperback, Revised)" },
    { label: "Third Edition", value: "October 1, 2021 (Ebook, Revised)" },
    { label: "ISBN", value: "978-1601631398" },
    { label: "Pages", value: "353" },
    { label: "Dimensions", value: "5.75 × 0.75 × 8.75 inches" },
  ];

  return (
    <section className="w-[90%] md:w-[85%] lg:w-[75%] mx-auto py-12 space-y-14">
      {/* Editorial Review */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          variants={fadeUp}
          custom={0}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight"
        >
          Editorial Review
        </motion.h2>

        <motion.h3
          variants={fadeUp}
          custom={1}
          className="text-lg md:text-xl font-semibold text-gray-800 mb-3"
        >
          Review
        </motion.h3>

        <ul className="space-y-2 text-gray-700 text-sm md:text-base leading-relaxed list-disc list-inside">
          {reviews.map((review, i) => (
            <motion.li
              key={i}
              variants={fadeUp}
              custom={i + 2} // each one slightly after the previous
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="font-semibold">“{review}”</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Divider */}
      <motion.hr
        variants={fadeUp}
        custom={reviews.length + 3}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-t border-gray-300"
      />

      {/* About Author */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          variants={fadeUp}
          custom={0}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight"
        >
          About Author
        </motion.h2>

        <motion.p
          variants={fadeUp}
          custom={1}
          className="text-gray-700 text-sm md:text-base leading-relaxed"
        >
          Godfrey Stanley Chijiokwu is an inspiring author and the founding pastor of Fruitful Grace Embassy Inc., a fast-growing and dynamic church located in Makurdi, Benue State, Nigeria. He is a passionate teacher of God’s Word, called to empower believers to walk in the fullness of their redemptive identity and live victoriously through the power of Christ.
With a heart for spiritual growth and transformation, Pastor Stanley combines biblical insight with practical wisdom to help people experience the reality of God’s grace in everyday life. His writings reflect his deep love for God and his commitment to seeing lives changed through the truth of the Gospel.
He continues to impact lives through his books, teachings, and ministry, inspiring many to grow in faith, purpose, and divine fruitfulness.
        </motion.p>
      </motion.div>

      {/* Divider */}
      <motion.hr
        variants={fadeUp}
        custom={2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-t border-gray-300"
      />

      {/* Book Details */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          variants={fadeUp}
          custom={0}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight"
        >
          Book Details
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 text-sm md:text-base text-gray-800">
          {bookDetails.map((detail, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="font-semibold">{detail.label}:</span>{" "}
              {detail.value}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutAuthor;