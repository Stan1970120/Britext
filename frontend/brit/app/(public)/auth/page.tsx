"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // ✨ Added icons

type OAuthProvider = "google" | "apple";

const API_URL = process.env.NEXT_PUBLIC_REST_API;

export default function SignInPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // ✨ Added toggle state
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect after login
  useEffect(() => {
    if (!showSuccess || !user) return;

    const timer = setTimeout(() => {
      if (user.role === "admin") {
        router.replace("/dashboard");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-green-600">
              Login Successful 🎉
            </h3>
            <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">
            Welcome Back 👋
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} // ✨ Dynamic type
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-sky-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-sky-700 text-white p-3 rounded-lg hover:bg-sky-800 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 uppercase tracking-wider text-xs">or sign in with</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-3">
            <button
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={18}
                height={18}
              />
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>

            <button
              onClick={() => handleOAuthLogin("apple")}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center"
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Apple"
                width={16}
                height={16}
              />
              <span className="text-sm font-medium text-gray-700">Apple</span>
            </button>
          </div>

          <p className="text-center text-sm mt-8 text-gray-600">
            Don’t have an account?{" "}
            <a href="/signup" className="text-sky-600 font-semibold hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}