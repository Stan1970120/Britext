"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { API } from "../../constant/api";

export default function SignInPage() {
  const router = useRouter();
  const { login, user, token, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const hasSynced = useRef(false);
  const hasRedirected = useRef(false);

  const syncGuestData = useCallback(async (userToken: string) => {
    // CRITICAL FIX: Lock immediately BEFORE starting async work to prevent duplicate loops
    if (hasSynced.current) return;
    hasSynced.current = true;

    try {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");

      const syncTasks = [];

      if (Array.isArray(guestCart) && guestCart.length > 0) {
        syncTasks.push(
          ...guestCart.map((bookId: string) =>
            fetch(API.CART, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({ bookId }),
            })
          )
        );
      }

      if (Array.isArray(guestWish) && guestWish.length > 0) {
        syncTasks.push(
          ...guestWish.map((bookId: string) =>
            fetch(API.TOGGLE_WISHLIST, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
              body: JSON.stringify({ bookId }),
            })
          )
        );
      }

      const ratingEntries = Object.entries(guestRatings);
      if (ratingEntries.length > 0) {
        syncTasks.push(
          ...ratingEntries.map(([bookId, rating]) =>
            fetch(API.RATE_BOOK, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
              body: JSON.stringify({ bookId, rating }),
            })
          )
        );
      }

      if (syncTasks.length > 0) {
        await Promise.allSettled(syncTasks);
        localStorage.removeItem("guestCart");
        localStorage.removeItem("guestWishlist");
        localStorage.removeItem("guestRatings");
        console.log("Guest data successfully synced to account.");
      }
    } catch (err) {
      console.error("Critical sync failure:", err);
    }
  }, []);

  useEffect(() => {
    if (user && token && !hasRedirected.current) {
      syncGuestData(token);

      const destination = user.role === "admin" ? "/dashboard" : "/profile";

      if (showSuccess) {
        const timer = setTimeout(() => {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.replace(destination);
          }
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        hasRedirected.current = true;
        router.replace(destination);
      }
    }
  }, [user, token, showSuccess, router, syncGuestData]);

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

  const handleOAuthLogin = async () => {
    await signIn("google", { callbackUrl: "/profile" });
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-green-600">Login Successful</h3>
            <p className="text-sm text-gray-600 mt-2">Personalizing your library...</p>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-700 text-white p-3 rounded-lg font-semibold disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 uppercase">or</span>
            </div>
          </div>

          <div className="mt-3">
            <button
              onClick={handleOAuthLogin}
              className="w-full flex items-center justify-center gap-2 border p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="G"
                width={18}
                height={18}
              />
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sky-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}


/*
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; 
import { API } from "../../constant/api";

export default function SignInPage() {
  const router = useRouter();
  const { login, user, token, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const hasSynced = useRef(false);

  const syncGuestData = async (userToken: string) => {
    if (hasSynced.current) return;

    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
    const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");

    try {
      const syncTasks = [];

      if (guestCart.length > 0) {
        syncTasks.push(...guestCart.map((bookId: string) =>
          fetch(API.CART, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              Authorization: `Bearer ${userToken}` 
            },
            body: JSON.stringify({ bookId }),
          })
        ));
      }

      if (guestWish.length > 0) {
        syncTasks.push(...guestWish.map((bookId: string) =>
          fetch(API.TOGGLE_WISHLIST, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ bookId }),
          })
        ));
      }

      const ratingEntries = Object.entries(guestRatings);
      if (ratingEntries.length > 0) {
        syncTasks.push(...ratingEntries.map(([bookId, rating]) =>
          fetch(API.RATE_BOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ bookId, rating }),
          })
        ));
      }

      if (syncTasks.length > 0) {
        await Promise.allSettled(syncTasks);
        localStorage.removeItem("guestCart");
        localStorage.removeItem("guestWishlist");
        localStorage.removeItem("guestRatings");
        console.log("Guest data successfully synced to account.");
      }

      hasSynced.current = true;
    } catch (err) {
      console.error("Critical sync failure:", err);
    }
  };

  useEffect(() => {
    if (user && token) {
      syncGuestData(token);

      const destination = user.role === "admin" ? "/dashboard" : "/profile";

      if (showSuccess) {
        const timer = setTimeout(() => {
          router.replace(destination);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        router.replace(destination);
      }
    }
  }, [user, token, showSuccess, router]);

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

  const handleOAuthLogin = () => {
    signIn("google", { callbackUrl: "/profile" });
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-green-600">Login Successful</h3>
            <p className="text-sm text-gray-600 mt-2">Personalizing your library...</p>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-700 text-white p-3 rounded-lg font-semibold disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500 uppercase">or</span></div>
          </div>

          <div className="mt-3">
            <button onClick={handleOAuthLogin} className="w-full flex items-center justify-center gap-2 border p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width={18} height={18} />
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sky-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}


"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; 
import { API } from "../../constant/api"; 
import { REST_API } from "../../constant";

type OAuthProvider = "google";

export default function SignInPage() {
  const router = useRouter();
  const { login, user, token, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const hasSynced = useRef(false);

  const syncGuestData = async (userToken: string) => {
    if (hasSynced.current) return;

    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
    const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");

    try {
      const syncTasks = [];

      if (guestCart.length > 0) {
        syncTasks.push(...guestCart.map((bookId: string) =>
          fetch(API.CART, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              Authorization: `Bearer ${userToken}` 
            },
            body: JSON.stringify({ bookId }),
          })
        ));
      }

      if (guestWish.length > 0) {
        syncTasks.push(...guestWish.map((bookId: string) =>
          fetch(API.TOGGLE_WISHLIST, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ bookId }),
          })
        ));
      }

      const ratingEntries = Object.entries(guestRatings);
      if (ratingEntries.length > 0) {
        syncTasks.push(...ratingEntries.map(([bookId, rating]) =>
          fetch(API.RATE_BOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ bookId, rating }),
          })
        ));
      }

      if (syncTasks.length > 0) {
        await Promise.allSettled(syncTasks);
        localStorage.removeItem("guestCart");
        localStorage.removeItem("guestWishlist");
        localStorage.removeItem("guestRatings");
        console.log("Guest data successfully synced to account.");
      }

      hasSynced.current = true;
    } catch (err) {
      console.error("Critical sync failure:", err);
    }
  };

  useEffect(() => {
    if (user && token) {
      syncGuestData(token);

      const destination = user.role === "admin" ? "/dashboard" : "/profile";

      if (showSuccess) {
        const timer = setTimeout(() => {
          router.replace(destination);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        router.replace(destination);
      }
    }
  }, [user, token, showSuccess, router]);

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
    window.location.href = `${REST_API}/auth/${provider}`;
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-green-600">Login Successful</h3>
            <p className="text-sm text-gray-600 mt-2">Personalizing your library...</p>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-700 text-white p-3 rounded-lg font-semibold disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500 uppercase">or</span></div>
          </div>

          <div className="mt-3">
            <button onClick={() => handleOAuthLogin("google")} className="w-full flex items-center justify-center gap-2 border p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width={18} height={18} />
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sky-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

*/