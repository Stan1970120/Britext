"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Users, ChevronDown, ChevronUp } from "lucide-react";

const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  viewport: { once: true },
});

const faqs = [
  {
    question: "How can I reset my password?",
    answer: "Click on 'Forgot Password' on the login page and follow the instructions to reset your password.",
  },
  {
    question: "Can I access BriText offline?",
    answer: "Currently, BriText requires an internet connection to access our digital library and resources.",
  },
  {
    question: "How do I join the BriText community?",
    answer: "You can join our community via the WhatsApp link provided in the contact section.",
  },
  {
    question: "What payment methods are available?",
    answer: "We support multiple payment methods including card payments, bank transfer, and mobile payments.",
  },
  {
    question: "How do I report an issue?",
    answer: "You can contact our support via WhatsApp or Email using the links below, and our team will assist you promptly.",
  },
];

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans">

      {/* ================= HERO SECTION ================= */}
      <motion.section
        {...fadeInUp(0)}
        className="w-full h-[60vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-sky-100 to-white"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Need Help?</h1>
        <p className="text-gray-700 text-lg md:text-xl max-w-2xl">
          We&apos;re here to support you! Check our FAQ or contact us directly for assistance.
        </p>
      </motion.section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <motion.h2 {...fadeInUp(0)} className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div key={idx} {...fadeInUp(idx * 0.1)} className="border rounded-2xl shadow-sm">
              <button
                className="w-full flex justify-between items-center p-6 text-left"
                onClick={() => toggleFAQ(idx)}
              >
                <span className="font-semibold">{faq.question}</span>
                {openFAQ === idx ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openFAQ === idx && (
                <div className="p-6 pt-0 text-gray-700 border-t">{faq.answer}</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= DIRECT CONTACT OPTIONS ================= */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" {...fadeInUp(0.2)}>

          {/* WhatsApp Contact */}
          <a
            href="https://wa.me/2348012345678?text=Hello%20BriText,%20I%20need%20help%20with..."
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-8 bg-green-50 rounded-2xl shadow-md hover:bg-green-100 transition cursor-pointer"
          >
            <Phone className="w-8 h-8 text-green-600" />
            <h3 className="font-semibold text-lg text-green-700">WhatsApp</h3>
            <p className="text-gray-600 text-sm">+234 801 234 5678</p>
          </a>

          {/* Email Contact */}
          <a
            href="mailto:support@britext.com?subject=Help%20Request&body=Hello%20BriText,%20I%20need%20assistance..."
            className="flex flex-col items-center gap-4 p-8 bg-blue-50 rounded-2xl shadow-md hover:bg-blue-100 transition cursor-pointer"
          >
            <Mail className="w-8 h-8 text-blue-600" />
            <h3 className="font-semibold text-lg text-blue-700">Email</h3>
            <p className="text-gray-600 text-sm">support@britext.com</p>
          </a>

          {/* Community Card */}
          <a
            href="https://wa.me/2348098765432?text=Hello%20BriText%20Community!"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-8 bg-purple-50 rounded-2xl shadow-md hover:bg-purple-100 transition cursor-pointer"
          >
            <Users className="w-8 h-8 text-purple-600" />
            <h3 className="font-semibold text-lg text-purple-700">Join Community</h3>
            <p className="text-gray-600 text-sm">Get support and updates from our community</p>
          </a>
        </motion.div>
      </section>

    </div>
  );
}
