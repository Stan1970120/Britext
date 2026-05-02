"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  User,
  MapPin,
  Menu,
  X,
  BookOpen,
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
      
      // 1. Execute the logout logic (clears token/state)
      await logout(); 
      
      
      if (typeof window !== "undefined") {
        window.location.href = "/"; 
      }
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  };

  
  const displayUser = isLoggingOut ? null : user;

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 md:px-10 flex items-center justify-between relative z-50">
      {/* LEFT SECTION: LOGO */}
      <div className="flex items-center gap-6">
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-black cursor-pointer"
        >
          Enjoy<span className="text-[#035b77]">Reads</span>
        </h1>
        <div className="hidden sm:flex items-center gap-1 text-gray-500 text-sm">
          <MapPin size={16} />
          <span>Nigeria</span>
        </div>
      </div>

      {/* RIGHT SECTION: AUTH & NAVIGATION */}
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

        {displayUser && (
          <button 
            onClick={() => router.push("/my-books")} 
            className="flex items-center gap-1 hover:text-[#035b77] transition font-medium"
          >
            <BookOpen size={18} />
            <span>My Books</span>
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
              onClick={() => router.push("/auth")} 
              className="bg-[#035b77] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#024a61] transition"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* MOBILE MENU TOGGLE */}
      <button 
        className="md:hidden text-gray-700" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* MOBILE MENU */}
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
              <LayoutDashboard size={20} /> Admin Dashboard
            </button>
          )}

          <button 
            onClick={() => { router.push(displayUser ? "/my-books" : "/auth"); setMobileMenuOpen(false); }} 
            className="flex items-center gap-3 font-medium"
          >
            <BookOpen size={20} /> My Books
          </button>

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
                className="flex items-center gap-3 text-red-500 font-bold pt-4 border-t"
              >
                <LogOut size={20} /> Logout
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
  );
};

export default Header;