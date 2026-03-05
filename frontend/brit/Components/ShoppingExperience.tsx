"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const textContainer: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.15,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const ShoppingExperience = () => {
  return (
    <section className="bg-[#8dd3e0] w-[95%] md:w-[90%] mx-auto rounded-3xl my-10 flex flex-row items-center justify-between p-4 sm:p-8 md:p-10 lg:p-14 overflow-hidden gap-2 sm:gap-6">
      {/* Text Section - Forced to 50% width */}
      <motion.div
        className="w-1/2 space-y-2 sm:space-y-4 text-left"
        variants={textContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2
          variants={textItem}
          className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
        >
          Join our community <br className="hidden sm:block" /> of EnjoyReads
        </motion.h2>

        <motion.p
          variants={textItem}
          className="text-[10px] sm:text-sm md:text-base text-gray-800 leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none"
        >
          Experience the best feeling of digital reading with like minds and stay updated with latest book releases.
        </motion.p>

        <motion.div variants={textItem}>
          <Link
            href="https://whatsapp.com/channel/0029VbBsDWK2v1IzHgXGXu2i"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 sm:px-6 py-1.5 sm:py-2 mt-1 sm:mt-2 border border-gray-900 rounded-full text-[10px] sm:text-sm font-medium hover:bg-gray-900 hover:text-white transition duration-300 whitespace-nowrap"
          >
            Let&apos;s Get Started
            <span className="ml-1 sm:ml-2 text-xs sm:text-lg">➜</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Image Section - Forced to 50% width */}
      <motion.div
        className="w-1/2 flex justify-end items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        <div className="relative w-full aspect-[4/5] sm:aspect-square max-w-[140px] sm:max-w-none">
          <Image
            src="/images/expshop.jpg"
            alt="EnjoyReads Community"
            fill
            className="rounded-xl sm:rounded-2xl object-cover shadow-lg"
            unoptimized
          />
        </div>
      </motion.div>
    </section>
  );
};

export default ShoppingExperience;