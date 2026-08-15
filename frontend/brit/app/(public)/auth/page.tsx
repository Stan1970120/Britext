// Britext/frontend/brit/app/(public)/auth/page.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { API } from "../../constant/api";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { login, user, token, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const hasSynced = useRef(false);

  // Dynamic redirect destination (defaults to /profile or /dashboard based on role)
  const queryRedirect = searchParams.get("redirect");

  const syncGuestData = useCallback(async (userToken: string) => {
    if (hasSynced.current) return;

    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
    const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");

    try {
      const syncTasks = [];

      if (guestCart.length > 0) {
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

      if (guestWish.length > 0) {
        syncTasks.push(
          ...guestWish.map((bookId: string) =>
            fetch(API.TOGGLE_WISHLIST, {
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

      const ratingEntries = Object.entries(guestRatings);
      if (ratingEntries.length > 0) {
        syncTasks.push(
          ...ratingEntries.map(([bookId, rating]) =>
            fetch(API.RATE_BOOK, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
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
      }

      hasSynced.current = true;
    } catch (err) {
      console.error("Critical sync failure:", err);
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      syncGuestData(token);

      const defaultDestination = user.role === "admin" ? "/dashboard" : "/profile";
      const targetDestination = queryRedirect || defaultDestination;

      // GUARD: Prevent redirect loop if target equals current path
      if (pathname === targetDestination) return;

      if (showSuccess) {
        const timer = setTimeout(() => {
          router.replace(targetDestination);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        router.replace(targetDestination);
      }
    }
  }, [user, token, showSuccess, router, queryRedirect, pathname, syncGuestData]);

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
    const targetRedirect = queryRedirect || "/profile";
    // Route through /auth/callback so AuthContext can extract backendToken
    const callbackDestination = `/auth/callback?redirect=${encodeURIComponent(targetRedirect)}`;
    
    await signIn("google", { 
      callbackUrl: callbackDestination,
      redirectTo: callbackDestination 
    });
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
              className="w-full bg-sky-700 text-white p-3 rounded-lg font-semibold disabled:bg-gray-400 hover:bg-sky-800 transition-colors"
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
              type="button"
              onClick={handleOAuthLogin}
              className="w-full flex items-center justify-center gap-2 border p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
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

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { API } from "../../constant/api";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { login, user, token, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const hasSynced = useRef(false);

  // Dynamic redirect destination (defaults to /profile or /dashboard based on role)
  const queryRedirect = searchParams.get("redirect");

  const syncGuestData = useCallback(async (userToken: string) => {
    if (hasSynced.current) return;

    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
    const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");

    try {
      const syncTasks = [];

      if (guestCart.length > 0) {
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

      if (guestWish.length > 0) {
        syncTasks.push(
          ...guestWish.map((bookId: string) =>
            fetch(API.TOGGLE_WISHLIST, {
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

      const ratingEntries = Object.entries(guestRatings);
      if (ratingEntries.length > 0) {
        syncTasks.push(
          ...ratingEntries.map(([bookId, rating]) =>
            fetch(API.RATE_BOOK, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
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
      }

      hasSynced.current = true;
    } catch (err) {
      console.error("Critical sync failure:", err);
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      syncGuestData(token);

      const defaultDestination = user.role === "admin" ? "/dashboard" : "/profile";
      const targetDestination = queryRedirect || defaultDestination;

      // GUARD: Prevent redirect loop if target equals current path
      if (pathname === targetDestination) return;

      if (showSuccess) {
        const timer = setTimeout(() => {
          router.replace(targetDestination);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        router.replace(targetDestination);
      }
    }
  }, [user, token, showSuccess, router, queryRedirect, pathname, syncGuestData]);

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
    const defaultDestination = user?.role === "admin" ? "/dashboard" : "/profile";
    const targetCallback = queryRedirect || defaultDestination;
    await signIn("google", { callbackUrl: targetCallback });
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
              className="w-full bg-sky-700 text-white p-3 rounded-lg font-semibold disabled:bg-gray-400 hover:bg-sky-800 transition-colors"
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
              type="button"
              onClick={handleOAuthLogin}
              className="w-full flex items-center justify-center gap-2 border p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
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
              Authorization: `Bearer ${userToken}`,
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