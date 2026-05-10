"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { REST_API } from "@/app/constant";

// Define the shape of our data
interface TestimonialData {
  _id: string;
  name: string;
  comment: string;
  role?: string;
  img?: string;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.2,
      ease: "easeInOut",
    },
  }),
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${REST_API}/comments`);
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

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

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-10 text-gray-400">Loading...</div>
          ) : testimonials.length === 0 ? (
            <div className="col-span-full py-10 text-gray-400 italic">No testimonials yet. Be the first to share!</div>
          ) : (
            testimonials.map((t, i) => (
              <motion.div
                key={t._id}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
              >
                <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
                  “{t.comment}”
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
                    <p className="text-gray-500 text-xs md:text-sm">{t.role || "Verified User"}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;