"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";

type OAuthProvider = "google" | "apple";

const API_URL = process.env.NEXT_PUBLIC_REST_API;

export default function SignInPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect after login
  useEffect(() => {
  if (!showSuccess || !user) return;

  const timer = setTimeout(() => {
    if (user.role === "admin") {
      router.replace("/books");
    } else {
      router.replace("/checkout");
    }
  }, 2000);

  return () => clearTimeout(timer);
}, [showSuccess, user, router]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleOAuthLogin = (provider: OAuthProvider) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <>
      {/* ✅ Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-xl font-semibold text-green-600">
              Login Successful 🎉
            </h3>
            <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">
            Welcome Back 👋
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-sky-700 text-white p-3 rounded-lg hover:bg-sky-800 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm mt-5 text-gray-600">or sign in with</p>

          <div className="flex justify-center gap-4 mt-3">
            <button
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={18}
                height={18}
              />
              Google
            </button>

            <button
              onClick={() => handleOAuthLogin("apple")}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Apple"
                width={16}
                height={16}
              />
              Apple
            </button>
          </div>

          <p className="text-center text-sm mt-5">
            Don’t have an account?{" "}
            <a href="/signup" className="text-sky-600 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
