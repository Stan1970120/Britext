"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion"; 

const Hero = () => {
  return (
    <section className="relative  w-full bg-[#035b77] text-white rounded-b-[2rem] overflow-hidden py-0 md:py-20 lg:py-0">
      {/* Flex container - always side by side */}
      <div className="flex flex-row items-center justify-between px-5 md:px-12 lg:px-20 max-w-7xl mx-auto relative">
        
        {/* TEXT SECTION */}
        <div className="flex-1 text-left z-20 relative space-y-4">
          <motion.h1
            className="font-bold text-1.5xl sm:text-1xl md:text-6xl lg:text-7xl leading-tight tracking-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Fast Book Shopping
          </motion.h1>

          <motion.p
            className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            We love to read, so do you. We provide you with the best online
            materials with easy access, quick shopping, fast and simple payment methods.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
  className="flex items-center gap-4 pt-6 flex-wrap"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.6 }}
>
  <motion.button
    whileHover={{ scale: 1.05 }}
    className="border border-white hover:bg-white hover:text-[#035b77] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base transition-all duration-300 flex items-center gap-2"
    onClick={() => window.location.href = "/book-store"} 
  >
    Explore Book
  </motion.button>
</motion.div>

        </div>

        {/*  IMAGE SECTION  */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex-1 flex justify-left mt-8 -ml-10 z-10 relative"
        >
          <div className="relative mt-">
            {/* Slight overlap toward the text */}
            <Image
              src="/images/shade-removebg-preview.png"
              alt="Excited girl holding a book"
              width={480}
              height={400}
              priority
              className="object-contain select-none  pointer-events-none 
                         w-[220px] sm:w-[300px] md:w-[380px] lg:w-[480px] 
                         -ml-8 sm:-ml-10 md:-ml-12 lg:-ml-16 ml-4 -mt-6 md:-mt-10 lg:-mt-12"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;