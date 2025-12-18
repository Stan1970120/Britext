"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

// Reusable comment component
const CommentSection = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "By Olamide A",
      email: "olamide@example.com",
      comment:
        "This platform is incredible! I love how easy it is to find the books I want and the reading community feels so lively.",
    },
    {
      id: 2,
      name: "By Adelalu Roheemah",
      email: "adelalu@example.com",
      comment:"I was able to get all my academic books with fast delivery. I can’t wait to see this platform grow!",
    },
  ]);

  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newComment = {
        id: comments.length + 1,
        name: form.name,
        email: form.email,
        comment: form.comment,
      };

      setComments((prev) => [newComment, ...prev]);
      setForm({ name: "", email: "", comment: "" });
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <section className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto py-16 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Share Your Thoughts 💬
        </h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Leave a comment about your experience with BriText. Your feedback helps others
          discover more.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="bg-white shadow-lg rounded-2xl p-6 md:p-10 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Write your comment..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        ></textarea>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-indigo-700 transition-colors text-white font-semibold px-6 py-3 rounded-full w-full md:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Send Comment"}
          {!isSubmitting && <Send className="w-5 h-5" />}
        </button>
      </motion.form>

      {/* Display Comments */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-semibold text-gray-800">Recent Comments</h3>

        <div className="space-y-5">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {comment.comment}
              </p>
              <div className="mt-3 text-sm text-gray-600 font-medium">
                — {comment.name}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default CommentSection;