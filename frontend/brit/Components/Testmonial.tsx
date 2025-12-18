"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.2,
      ease: "easeInOut", // <-- Use a string, not an array of numbers
    },
  }),
};

const testimonials = [
  {
    text: "ReadMore made it super easy for me to get all the books I needed for school this semester. I even found revision guides I couldn’t get in local stores. The delivery was fast and the prices were fair — definitely my new go-to!",
    name: "Adelalu Roheemah",
    role: "Undergraduate Student",
    img: "/images/user1.png",
  },
  {
    text: "I was looking for educational books for my kids and stumbled on ReadMore. I love how organized the categories are and that I could add school stationery too. It saved me time and stress — very convenient!",
    name: "Mrs Tina. E",
    role: "Parent",
    img: "/images/user2.png",
  },
  {
    text: "I found some amazing business and self-help books on ReadMore that really helped me in my career. It’s easy to use and I love the clean design. I even ordered a journal along with my books — it’s like a mini productivity hub!",
    name: "Adebayo Elizabeth",
    role: "Project Manager",
    img: "/images/user3.png",
  },
  {
    text: "As a fiction lover, I was impressed by the range of novels on ReadMore — from African writers to international bestsellers. The reviews helped me choose what to read next. Top notch!",
    name: "Olamide A",
    role: "Avid Reader",
    img: "/images/user4.png",
  },
  {
    text: "I was surprised to find rare and collectible editions on ReadMore. The descriptions are detailed, and packaging was excellent. It’s clear they care about the reading community.",
    name: "Chuka. E",
    role: "Collector & Book Blogger",
    img: "/images/user5.png",
  },
  {
    text: "I’ve made multiple purchases on ReadMore and every time, the service has been consistent. Fast delivery, smooth checkout, and quality products. I love how they spotlight trending titles.",
    name: "Emeka J",
    role: "Returning Customer",
    img: "/images/user6.png",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold text-gray-900"
        >
          Experience the Best Feeling of Shopping
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gray-600 mt-4 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed"
        >
          Enjoy the ease of online shopping with ReadMore — all your favorites in one place.  
          Fast delivery, easy checkout, and the best book collections for every reader.
        </motion.p>

        {/* Testimonials Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
            >
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
                “{t.text}”
              </p>

              <div className="flex items-center gap-4 mt-auto">
                {t.img ? (
                  <Image
                    src={t.img}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                    {t.name}
                  </h4>
                  <p className="text-gray-500 text-xs md:text-sm">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;