"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { User, Heart, Clock, Settings, ShieldCheck, Mail, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "saved" | "orders">("info");

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 mb-4">Please log in to view your profile.</p>
        <a href="/auth" className="bg-[#035b77] text-white px-6 py-2 rounded-lg">Login</a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* LEFT SIDE: SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 space-y-2">
          <div className="mb-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900">Account</h1>
            <p className="text-sm text-gray-500">Manage your preferences</p>
          </div>

          <button
            onClick={() => setActiveTab("info")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === "info" ? "bg-[#035b77] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User size={18} /> <span className="font-medium">Personal Info</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === "saved" ? "bg-[#035b77] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart size={18} /> <span className="font-medium">Saved for Later</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === "orders" ? "bg-[#035b77] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock size={18} /> <span className="font-medium">Order History</span>
          </button>

          <div className="pt-8 mt-8 border-t">
            <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition">
              <LogOut size={18} /> <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: CONTENT AREA */}
        <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === "info" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">First Name</label>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2 border">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-700">{user.firstName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Last Name</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-700">{user.lastName}</span>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2 border">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Account Role</label>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2 border">
                    <ShieldCheck size={16} className="text-[#035b77]" />
                    <span className="text-gray-700 capitalize">{user.role || "User"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAVED BOOKS */}
          {activeTab === "saved" && (
            <div className="animate-in fade-in duration-300 text-center py-12">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={24} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold">Your Wishlist is Empty</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                Books you heart while browsing the store will appear here for later.
              </p>
              <button onClick={() => window.location.href='/'} className="mt-6 text-[#035b77] font-bold underline">
                Browse Books
              </button>
            </div>
          )}

          {/* TAB 3: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
              <p className="text-sm text-gray-500 italic">No recent transactions found.</p>
              {/* You can map through user orders here once you fetch them from the API */}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}