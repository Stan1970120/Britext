"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebookF, FaWhatsapp, FaTiktok } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-[#075a5a] text-gray-100 py-10 mt-10">
      {/* Top Section */}
      <div className="w-[90%] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
        {/* Column 1 */}
        <div>
          <h3 className="font-semibold mb-3 text-white">Get to know Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/career" className="hover:underline">Career</Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">About BriText</Link>
            </li>
            <li>
              <Link href="/products" className="hover:underline">Our Products</Link>
            </li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="font-semibold mb-3 text-white">Sell with Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/advertise" className="hover:underline">Advertise your products</Link>
            </li>
            <li>
              <Link href="/self-publish" className="hover:underline">Self Publish with Britext</Link>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="font-semibold mb-3 text-white">Our Payment Products</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/pay" className="hover:underline">Payment with Britext</Link>
            </li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h3 className="font-semibold mb-3 text-white">Help</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/contact" className="hover:underline">Contact Us</Link>
            </li>
           
            <li>
              <Link href="/help" className="hover:underline">Help</Link>
            </li>
          </ul>
        </div>

        {/* Column 5 */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <h2 className="text-2xl font-semibold text-white mb-2">Britext</h2>
          <p className="text-sm text-gray-200 leading-relaxed">
            Britext is an online platform professionally built for all series of items,
            from books to home accessories. We deliver the best product and sell only quality.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-400 mt-8 pt-4 w-[90%] mx-auto"></div>

      

      {/* Animated Social Media Icons */}
      <motion.div
        className="mt-6 w-[90%] mx-auto flex justify-center sm:justify-end gap-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <Link
          href="https://www.facebook.com/share/17RSMUKvps/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-all transform hover:scale-110"
        >
          <FaFacebookF size={22} />
        </Link>
        <Link
          href="https://www.tiktok.com/@dividingthewordoftruth?_r=1&_t=ZM-91TOPXFSUZM
"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-300 transition-all transform hover:scale-110"
        >
          <FaTiktok size={22} />
        </Link>
        <Link
          href="https://youtube.com/@dividingthewordoftruthtv?si=H9fGQcYaEfoL0OIb
"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-green-400 transition-all transform hover:scale-110"
        >
          <FaWhatsapp size={22} />
        </Link>
          </motion.div>
          <p className="text-center mt-4 sm:text-center">
          © 2025–2025 Britext Policy, Inc. or its affiliate
        </p>
    </footer>
  );
};

export default Footer;