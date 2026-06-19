"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import {
  User,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const Header = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setMobileMenuOpen(false);
      
      await logout(); 
      
      if (typeof window !== "undefined") {
        // Redirect admins to the authentication route instead of a literal /404 path
        window.location.href = "/auth"; 
      }
    } catch (error) {
      console.error("Logout failed:", error);
      if (typeof window !== "undefined") {
        //Fallback fallback safely to the central authentication view
        window.location.href = "/auth";
      }
    }
  };

  const displayUser = isLoggingOut ? null : user;

  return (
    <>
      {/* 3D Flip Keyframes Injection */}
      <style jsx global>{`
        @keyframes flip3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-flip-3d {
          animation: flip3d 5s linear infinite;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      <header className="w-full bg-white shadow-sm py-3 px-4 sm:px-6 md:px-8 relative z-50">
        <div className="w-full flex items-center justify-between">
          
          {/* LEFT SIDE: Logo & Brand Group */}
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                onClick={() => router.push("/")}
                className="relative h-9 w-28 sm:h-10 sm:w-40 cursor-pointer font-black"
              >
                <Image
                  src="/images/file_00000000d448724396c6e1ff98649aaf.png"
                  alt="Logo"
                  fill
                  className="object-contain font-black brightness-95 contrast-125"
                  priority
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-slate-900 tracking-wide mt-0.5 select-none">
                <span className="text-[#035b77]">Enjoy</span>Reads
              </span>
            </div>
          </div>

          {/* Fluid 3D Flipping Informational Card */}
          <div className="flex justify-center items-center flex-1 px-2" style={{ perspective: "1000px" }}>
            <div className="relative h-10 w-24 xs:w-28 sm:w-32 md:h-12 md:w-40 preserve-3d animate-flip-3d">
              
              {/* Front Side of Card */}
              <div className="absolute inset-0 bg-[#035b77] text-white rounded-md flex flex-col items-center justify-center font-bold px-1 text-center shadow-md backface-hidden select-none border border-[#024a61]">
                <span className="text-[8px] xs:text-[9px] sm:text-xs uppercase tracking-wider text-teal-200">Secrets</span>
                <span className="text-[9px] xs:text-[10px] sm:text-sm leading-tight">of Reading</span>
              </div>

              {/* Back Side of Card */}
              <div className="absolute inset-0 bg-white text-gray-900 rounded-md flex items-center justify-center font-bold px-1 text-center shadow-md backface-hidden rotate-y-180 select-none border border-[#035b77]">
                <span className="text-[9px] xs:text-[11px] sm:text-sm tracking-wide"><span className="text-[#035b77]">Enjoy</span>Reads</span>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE  Profile or Auth Buttons */}
          <div className="hidden md:flex items-center gap-6 text-gray-700 text-sm">
            {displayUser?.role === "admin" && (
              <button 
                onClick={() => router.push("/admin")} 
                className="flex items-center gap-1 text-[#035b77] font-semibold hover:opacity-80 transition"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            )}

            {displayUser ? (
              <div className="flex items-center gap-4 border-l pl-6">
                <button 
                  onClick={() => router.push("/profile")} 
                  className="flex items-center gap-2 font-medium text-gray-900 hover:text-[#035b77] transition"
                >
                  <div className="w-8 h-8 bg-[#035b77] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {displayUser?.firstName?.[0] || ""}{displayUser?.lastName?.[0] || ""}
                  </div>
                  <span>Profile</span>
                </button>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                  title="Logout"
                  disabled={isLoggingOut}
                >
                  <LogOut size={18} className={isLoggingOut ? "animate-spin" : ""} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push("/auth")} 
                  className="text-gray-600 font-medium hover:text-[#035b77]"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => router.push("/signup")} 
                  className="bg-[#035b77] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#024a61] transition"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE MOBILE BUTTON */}
          <button 
            className="md:hidden text-gray-700 p-1 relative z-50 ml-1" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* Mobile Portal Overlays */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl flex flex-col p-6 space-y-6 md:hidden border-t animate-in fade-in slide-in-from-top-2">
            {displayUser && (
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-bold text-[#035b77]">{displayUser?.firstName} {displayUser?.lastName}</p>
              </div>
            )}
            
            {displayUser?.role === "admin" && (
              <button 
                onClick={() => { router.push("/admin"); setMobileMenuOpen(false); }} 
                className="flex items-center gap-3 text-[#035b77] font-bold"
              >
                <LayoutDashboard size={20} /> Dashboard
              </button>
            )}

            {displayUser ? (
              <>
                <button 
                  onClick={() => { router.push("/profile"); setMobileMenuOpen(false); }} 
                  className="flex items-center gap-3 font-medium"
                >
                  <User size={20} /> Profile Settings
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-3 text-red-500 font-bold pt-4 border-t w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { router.push("/auth"); setMobileMenuOpen(false); }} 
                  className="w-full bg-[#035b77] text-white py-3 rounded-xl font-bold"
                >
                  Login / Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;


/*

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; 
import { API } from "../../constant/api"; 
import { REST_API } from "../../constant";

type OAuthProvider = "google" | "apple";

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
    // API.CART
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

          <div className="flex gap-4 mt-3">
            <button onClick={() => handleOAuthLogin("google")} className="flex-1 flex items-center justify-center gap-2 border p-2 rounded-lg hover:bg-gray-50">
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width={18} height={18} />
              <span className="text-sm">Google</span>
            </button>
            <button onClick={() => handleOAuthLogin("apple")} className="flex-1 flex items-center justify-center gap-2 border p-2 rounded-lg hover:bg-gray-50">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="A" width={16} height={16} />
              <span className="text-sm">Apple</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

*/

/*
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; 
import { API } from "../../constant/api"; 
import { REST_API } from "../../constant";

type OAuthProvider = "google" | "apple";

export default function SignInPage() {
  const router = useRouter();
  const { login, user, token, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Prevent multiple syncs in a single mount
  const hasSynced = useRef(false);

  // Comprehensive Sync Logic
  const syncGuestData = async (userToken: string) => {
    if (hasSynced.current) return;

    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const guestWish = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
    const guestRatings = JSON.parse(localStorage.getItem("guestRatings") || "{}");

    try {
      const syncTasks = [];

      // 1. Sync Cart
      if (guestCart.length > 0) {
        syncTasks.push(...guestCart.map((bookId: string) =>
          fetch(API.ADD_TO_CART, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ bookId }),
          })
        ));
      }

      // 2. Sync Wishlist
      if (guestWish.length > 0) {
        syncTasks.push(...guestWish.map((bookId: string) =>
          fetch(API.TOGGLE_WISHLIST, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ bookId }),
          })
        ));
      }

      // 3. Sync Ratings
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
        // Clear local storage only after attempt
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

      const destination = user.role === "admin" ? "/dashboard" : "/checkout";

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

          <div className="flex gap-4 mt-3">
            <button onClick={() => handleOAuthLogin("google")} className="flex-1 flex items-center justify-center gap-2 border p-2 rounded-lg hover:bg-gray-50">
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width={18} height={18} />
              <span className="text-sm">Google</span>
            </button>
            <button onClick={() => handleOAuthLogin("apple")} className="flex-1 flex items-center justify-center gap-2 border p-2 rounded-lg hover:bg-gray-50">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="A" width={16} height={16} />
              <span className="text-sm">Apple</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
*/