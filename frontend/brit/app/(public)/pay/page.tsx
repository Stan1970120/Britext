"use client";

import { motion } from "framer-motion";
import { CreditCard, Shield, Wallet, CheckCircle } from "lucide-react";

const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
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

export default function PaymentPage() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans">

      {/* ================= HERO SECTION ================= */}
      <motion.section
        {...fadeInUp(0)}
        className="w-full h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-r from-sky-200 via-white to-sky-100"
      >
        <CreditCard className="w-16 h-16 text-sky-600 mb-4 animate-bounce" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
        >
          Payment With BriText
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-700 text-lg md:text-xl max-w-2xl"
        >
          Enjoy fast, secure, and easy payments for all your digital books and resources.
          Multiple payment options available to suit your needs all round.
        </motion.p>
      </motion.section>

      {/* ================= PAYMENT FEATURES ================= */}
      <section className="py-20">
        <motion.h2 {...fadeInUp(0)} className="text-3xl font-bold text-center mb-12">
          Why BriText Payments Are Safe & Easy
        </motion.h2>

        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="whileInView"
          className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-10 px-6"
        >
          {[
            {
              icon: <CreditCard className="w-10 h-10 text-sky-600 mx-auto mb-4" />,
              title: "Multiple Payment Methods",
              text: "Pay with cards, mobile wallets, and other convenient options.",
            },
            {
              icon: <Shield className="w-10 h-10 text-sky-600 mx-auto mb-4" />,
              title: "Secure Transactions",
              text: "We use encryption and trusted payment gateways to protect your data.",
            },
            {
              icon: <Wallet className="w-10 h-10 text-sky-600 mx-auto mb-4" />,
              title: "Fast & Hassle-Free",
              text: "Complete your payments in just a few clicks without delays.",
            },
            {
              icon: <CheckCircle className="w-10 h-10 text-sky-600 mx-auto mb-4" />,
              title: "Trusted by Thousands",
              text: "Our platform is reliable and trusted by thousands of readers.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={staggerChild}
              className="bg-white shadow-md rounded-2xl p-8 text-center"
            >
              {item.icon}
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= ADDITIONAL INFO ================= */}
      <section className="py-20 bg-gray-50">
        <motion.div {...fadeInUp(0)} className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">Safe Payments You Can Trust</h2>
          <p className="text-gray-700 text-lg">
            BriText partners with leading payment providers to ensure your transactions
            are secure and seamless. Focus on discovering and reading, while we handle
            your payments safely.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
