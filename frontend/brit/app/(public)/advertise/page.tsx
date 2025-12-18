"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail } from "lucide-react";

export default function AdSignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    product: "",
    description: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setFormData({ name: "", company: "", email: "", product: "", description: "" });
  };

  const fadeInUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
    viewport: { once: true },
  });

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans">

      {/*  HERO  */}
      <motion.section
        {...fadeInUp(0)}
        className="w-full h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-r from-sky-200 via-white to-sky-100"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
        >
          Advertise Your Product With BriText
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-700 text-lg md:text-xl max-w-2xl"
        >
          Reach thousands of users by showcasing your products on BriText. Fill out the form below or contact us directly.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <button className="mt-6 px-8 py-3 bg-sky-600 text-white rounded-2xl shadow-md hover:bg-sky-700 transition-all">
            Start Advertising
          </button>
        </motion.div>
      </motion.section>

      {/*  FORM & CONTACT OPTIONS  */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <motion.div variants={fadeInUp(0)} className="grid md:grid-cols-2 gap-12">

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold mb-4">Fill Out the Form</h2>

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="text"
              name="product"
              placeholder="Product Name"
              value={formData.product}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <textarea
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 text-white font-semibold rounded-2xl hover:bg-sky-700 transition-all"
            >
              Submit
            </button>
          </form>

          {/* CONTACT OPTIONS */}
          <motion.div variants={fadeInUp(0.2)} className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold mb-4">Or Contact Directly</h2>

            <a
              href={`https://wa.me/2348012345678?text=Hello%20BriText,%20I%20want%20to%20advertise%20my%20product.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 bg-green-50 rounded-2xl hover:bg-green-100 transition cursor-pointer"
            >
              <Phone className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-700">WhatsApp</p>
                <p className="text-gray-600 text-sm">+234 801 234 5678</p>
              </div>
            </a>

            <a
              href={`mailto:advertise@britext.com?subject=Advertise%20My%20Product&body=Hello%20BriText,%20I%20want%20to%20advertise%20my%20product.`}
              className="flex items-center gap-4 p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition cursor-pointer"
            >
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-700">Email</p>
                <p className="text-gray-600 text-sm">advertise@britext.com</p>
              </div>
            </a>
          </motion.div>

        </motion.div>
      </section>

      {/*  SUCCESS MODAL  */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 flex justify-center items-center bg-black/50 z-50"
        >
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-4">Thank You!</h3>
            <p className="mb-6 text-gray-700">Your advertising request has been submitted successfully.</p>
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-2 bg-sky-600 text-white rounded-2xl hover:bg-sky-700 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
