"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const textContainer: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.25,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 20 },
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
    <section className="bg-[#8dd3e0] w-[90%] mx-auto rounded-3xl my-10 flex flex-row flex-wrap items-center justify-between p-4 sm:p-6 md:p-10 lg:p-14 overflow-hidden">
      {/* Text Section */}
      <motion.div
        className="w-1/2 space-y-4 text-center sm:text-left"
        variants={textContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2
          variants={textItem}
          className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-snug"
        >
          Experience the Best feeling <br className="hidden sm:block" /> of Shopping
        </motion.h2>

        <motion.p
          variants={textItem}
          className="text-xs sm:text-sm md:text-base text-gray-800 leading-relaxed"
        >
          Experience the best feeling of easy online shopping with Britext, your all-in-one
          destination for favourite books and stories. 
        </motion.p>

        <motion.div variants={textItem}>
          <Link
            href="/book-store"
            className="inline-flex items-center justify-center px-4 sm:px-6 py-2 mt-2 border border-gray-700 rounded-full text-gray-800 font-medium hover:bg-gray-900 hover:text-white transition duration-300"
          >
            View more
            <span className="ml-2 text-lg">➜</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Image Section */}
      <motion.div
        className="w-1/2 flex justify-center"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.8 }}
      >
        <Image
          src="/images/expshop.jpg"
          alt="Happy Shopper"
          width={400}
          height={500}
          className="rounded-2xl object-cover 
                     w-[160px] h-[210px] 
                     sm:w-[250px] sm:h-[300px] 
                     md:w-[340px] md:h-[350px] 
                     lg:w-[350px] lg:h-[300px]
                     scale-110 sm:scale-110 md:scale-110 lg:scale-100
                     transition-transform duration-700 ease-out"
        />
      </motion.div>
    </section>
  );
};

export default ShoppingExperience;