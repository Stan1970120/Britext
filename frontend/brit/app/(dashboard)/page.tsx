"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Bookmark, 
  History, 
  LogOut, 
  ShoppingBag, 
  BookOpen,
  ChevronRight 
} from "lucide-react";
import Link from "next/link";

type Tab = "personal" | "saved" | "history";

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  // Mock user data - replace with your actual auth state/API call
  const user = {
    firstName: "PHILIP TERFA",
    lastName: "WASEM",
    email: "autofy18@gmail.com",
    role: "User"
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:px-24">
      {/* Top Navigation for quick access */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Account</h1>
          <p className="text-slate-500 font-medium">Manage your preferences</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/book-store" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all"
          >
            <BookOpen size={18} /> Store
          </Link>
          <Link 
            href="/checkout" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-100"
          >
            <ShoppingBag size={18} /> Cart
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab("personal")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === "personal" 
              ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
              : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <User size={20} /> Personal Info
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === "saved" 
              ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
              : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Bookmark size={20} /> Saved for Later
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === "history" 
              ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
              : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <History size={20} /> Order History
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[500px]">
            {activeTab === "personal" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-black text-slate-900 mb-8">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">First Name</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">
                      {user.firstName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Last Name</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">
                      {user.lastName}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Email Address</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">
                      {user.email}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Account Role</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" /> {user.role}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "saved" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center text-sky-600 mb-4">
                  <Bookmark size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Your wishlist is empty</h3>
                <p className="text-slate-500 mt-2 mb-6">Browse the store to save books you love for later.</p>
                <Link href="/book-store" className="text-sky-600 font-bold flex items-center gap-2 hover:underline">
                  Visit Store <ChevronRight size={16} />
                </Link>
              </div>
            )}

            {activeTab === "history" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <History size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">No orders yet</h3>
                <p className="text-slate-500 mt-2 mb-6">Your transaction history will appear here after your first purchase.</p>
                <Link href="/book-store" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-600 transition-colors">
                  Start Reading
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}