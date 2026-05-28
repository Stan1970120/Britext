"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { REST_API } from "@/app/constant";

interface CommentType {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

const CommentSection = () => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments from DB
  const fetchComments = async () => {
    try {
      const res = await fetch(`${REST_API}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${REST_API}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ name: "", email: "", comment: "" });
        fetchComments(); 
      }
    } catch (err) {
      alert("Error submitting comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto py-16 space-y-10">
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
          Leave a comment about your experience with EnjoyReads. Your feedback helps others
          discover more.
        </p>
      </motion.div>

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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            required
          />
        </div>

        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Write your comment..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          required
        ></textarea>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-indigo-700 transition-colors text-white font-semibold px-6 py-3 rounded-full w-full md:w-auto disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Send Comment"}
          {!isSubmitting && <Send className="w-5 h-5" />}
        </button>
      </motion.form>
    </section>
  );
};

export default CommentSection;

/*
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { REST_API } from "@/app/constant";

interface CommentType {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

const CommentSection = () => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments from DB
  const fetchComments = async () => {
    try {
      const res = await fetch(`${REST_API}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${REST_API}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ name: "", email: "", comment: "" });
        fetchComments(); 
      }
    } catch (err) {
      alert("Error submitting comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto py-16 space-y-10">
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
          Leave a comment about your experience with EnjoyReads. Your feedback helps others
          discover more.
        </p>
      </motion.div>

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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            required
          />
        </div>

        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Write your comment..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          required
        ></textarea>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-indigo-700 transition-colors text-white font-semibold px-6 py-3 rounded-full w-full md:w-auto disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Send Comment"}
          {!isSubmitting && <Send className="w-5 h-5" />}
        </button>
      </motion.form>

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
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {comment.comment}
              </p>
              <div className="mt-3 text-sm text-gray-600 font-medium italic">
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
*/