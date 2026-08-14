// Britext/frontend/brit/app/(dashboard)/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Bookmark, 
  History, 
  ShoppingBag, 
  BookOpen,
  ChevronRight,
  Library,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Plus,
  Minus
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import Header from "@/Components/Header"; 
import { REST_API } from "@/app/constant";
import { API } from "@/app/constant/api";
import BookStore from "@/app/(public)/book-store/page";


interface AppUser {
  id: string;
  email?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

type Tab = "my-books" | "store" | "cart" | "saved" | "history";

interface Book {
  id: string;
  title: string;
  author: string;
  price?: number;
  category?: string;
  coverImage?: string;
}

export type CartItem = {
  bookId: string;
  quantity: number;
  book?: {
    _id: string;
    title: string;
    category: string;
    price: number;
    coverImage?: string;
  };
};

export default function UserDashboard() {
  const { user, token, loading: authLoading } = useAuth() as { 
    user: AppUser | null; 
    token: string | null;
    loading: boolean;
  };

  const [activeTab, setActiveTab] = useState<Tab>("my-books");
  const [ownedBooks, setOwnedBooks] = useState<Book[]>([]);
  const [fetchingBooks, setFetchingBooks] = useState(false);
  
  // Cart tab states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // State to toggle sidebar collapse/expand
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch My Books
  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!user?.id) return;
      
      try {
        setFetchingBooks(true);
        const response = await fetch(`${REST_API}/users/${user.id}/books`);
        
        if (response.ok) {
          const data: Book[] = await response.json();
          setOwnedBooks(data);
        }
      } catch (error) {
        console.error("Failed to fetch user books:", error);
      } finally {
        setFetchingBooks(false);
      }
    };

    if (activeTab === "my-books") {
      fetchMyBooks();
    }
  }, [user?.id, activeTab]);

  // Fetch Cart Items from API when Cart tab is selected
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        setLoadingCart(true);
        const res = await fetch(API.CART, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCartItems(data?.items || []);
        }
      } catch (err) {
        console.error("Failed to load cart", err);
      } finally {
        setLoadingCart(false);
      }
    };

    if (activeTab === "cart" && token) {
      fetchCart();
    }
  }, [token, activeTab]);

  // Quantity updates for Cart
  const updateQuantity = async (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(bookId);
      return;
    }

    try {
      const res = await fetch(API.CART, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, quantity }),
      });

      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.bookId === bookId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to update cart quantity", err);
    }
  };

  // Remove Item from Cart
  const removeItem = async (bookId: string) => {
    try {
      const res = await fetch(`${API.CART}/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.bookId !== bookId));
      }
    } catch (err) {
      console.error("Failed to remove item from cart", err);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.book?.price || 0) * item.quantity,
      0
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
          <div className="h-4 w-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 px-6 text-center">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-md w-full">
            <UserIcon className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-8">Please log in to your account to view your dashboard and orders.</p>
            <Link 
              href="/auth" 
              className="block w-full bg-[#035b77] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#024a61] hover:scale-[1.02] transition-all"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white p-6 md:p-12 lg:px-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Account</h1>
            <p className="text-slate-500 font-medium">Manage your library and preferences</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-sm"
              title={isSidebarOpen ? "Collapse Navigation" : "Expand Navigation"}
            >
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              <span>
                {isSidebarOpen ? "Hide Menu" : "Show Menu"}
              </span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start transition-all duration-300">
          {/* Sidebar Navigation */}
          {isSidebarOpen && (
            <div className="lg:col-span-3 space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
              {(["my-books", "store", "cart", "saved", "history"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all capitalize ${
                    activeTab === tab 
                    ? "bg-[#035b77] text-white shadow-lg shadow-teal-50" 
                    : "text-slate-500 hover:bg-slate-100/50"
                  }`}
                >
                  {tab === "my-books" && <Library size={20} />}
                  {tab === "store" && <Store size={20} />}
                  {tab === "cart" && <ShoppingBag size={20} />}
                  {tab === "saved" && <Bookmark size={20} />}
                  {tab === "history" && <History size={20} />}
                  {tab.replace("-", " ")}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className={isSidebarOpen ? "lg:col-span-9" : "lg:col-span-12"}>
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm min-h-[500px]">
              
              {/* MY BOOKS TAB */}
              {activeTab === "my-books" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                  <h2 className="text-xl font-black text-slate-900 mb-8">My Library</h2>
                  
                  {fetchingBooks ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-3" />
                          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                        </div>
                      ))}
                    </div>
                  ) : ownedBooks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {ownedBooks.map((book) => (
                        <div key={book.id} className="group cursor-pointer">
                          <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-3 overflow-hidden">
                            {book.coverImage && (
                              <img 
                                src={book.coverImage} 
                                alt={book.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{book.title}</h4>
                          <p className="text-xs text-slate-500">{book.author}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 bg-[#035b77]/10 rounded-full flex items-center justify-center text-[#035b77] mb-4">
                        <BookOpen size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Your shelf is empty</h3>
                      <p className="text-slate-500 mt-2 mb-6">You haven&apos;t purchased any books yet.</p>
                      <button 
                        onClick={() => setActiveTab("store")}
                        className="bg-[#035b77] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#024a61] transition-colors"
                      >
                        Explore Store
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STORE TAB */}
              {activeTab === "store" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <BookStore />
                </div>
              )}

              {/* CART TAB */}
              {activeTab === "cart" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-black text-slate-900 mb-6">Your Cart</h2>
                  
                  {loadingCart ? (
                    <div className="flex justify-center items-center py-16">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-[#035b77] rounded-full animate-spin"></div>
                    </div>
                  ) : cartItems.length > 0 ? (
                    <div className="space-y-6">
                      <div className="divide-y divide-slate-100">
                        {cartItems.map((item) => (
                          <div key={item.bookId} className="py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.book?.coverImage && (
                                  <img 
                                    src={item.book.coverImage} 
                                    alt={item.book.title} 
                                    className="w-full h-full object-cover" 
                                  />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 line-clamp-1">{item.book?.title || "Book"}</h4>
                                <p className="text-xs text-slate-500 mb-1">{item.book?.category}</p>
                                <p className="text-sm font-semibold text-[#035b77]">${item.book?.price}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
                                <button 
                                  onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <button 
                                onClick={() => removeItem(item.bookId)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Subtotal</p>
                          <p className="text-2xl font-black text-slate-900">${calculateSubtotal().toFixed(2)}</p>
                        </div>
                        <Link 
                          href="/checkout"
                          className="w-full sm:w-auto bg-[#035b77] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#024a61] transition-colors text-center shadow-lg"
                        >
                          Proceed to Checkout
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                        <ShoppingBag size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Your cart is empty</h3>
                      <p className="text-slate-500 mt-1 mb-6">Looks like you haven&apos;t added any items to your cart yet.</p>
                      <button 
                        onClick={() => setActiveTab("store")}
                        className="bg-[#035b77] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#024a61] transition-colors"
                      >
                        Explore Store
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SAVED & HISTORY TABS */}
              {activeTab !== "my-books" && activeTab !== "store" && activeTab !== "cart" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    {activeTab === "saved" ? <Bookmark size={32} /> : <History size={32} />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {activeTab === "saved" ? "Your wishlist is empty" : "No orders yet"}
                  </h3>
                  <button 
                    onClick={() => setActiveTab("store")}
                    className="text-sky-600 font-bold mt-4 hover:underline flex items-center justify-center gap-1"
                  >
                    Visit Store <ChevronRight size={16} />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}


/*
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
    const isAdmin = user?.role === "admin";
    
    try {
      setIsLoggingOut(true);
      setMobileMenuOpen(false);
      
      await logout(); 
      
      if (typeof window !== "undefined") {
        window.location.href = isAdmin ? "/404" : "/"; 
      }
    } catch (error) {
      console.error("Logout failed:", error);
      if (typeof window !== "undefined") {
        window.location.href = isAdmin ? "/404" : "/";
      }
    }
  };

  const displayUser = isLoggingOut ? null : user;

  return (
    <>
      
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

          
          <div className="flex justify-center items-center flex-1 px-2" style={{ perspective: "1000px" }}>
            <div className="relative h-10 w-24 xs:w-28 sm:w-32 md:h-12 md:w-40 preserve-3d animate-flip-3d">
              
             
              <div className="absolute inset-0 bg-[#035b77] text-white rounded-md flex flex-col items-center justify-center font-bold px-1 text-center shadow-md backface-hidden select-none border border-[#024a61]">
                <span className="text-[8px] xs:text-[9px] sm:text-xs uppercase tracking-wider text-teal-200">Secrets</span>
                <span className="text-[9px] xs:text-[10px] sm:text-sm leading-tight">of Reading</span>
              </div>

              
              <div className="absolute inset-0 bg-white text-gray-900 rounded-md flex items-center justify-center font-bold px-1 text-center shadow-md backface-hidden rotate-y-180 select-none border border-[#035b77]">
                <span className="text-[9px] xs:text-[11px] sm:text-sm tracking-wide"><span className="text-[#035b77]">Enjoy</span>Reads</span>
              </div>

            </div>
          </div>

          
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

         
          <button 
            className="md:hidden text-gray-700 p-1 relative z-50 ml-1" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        
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
                  className="flex items-center gap-3 text-red-500 font-bold pt-4 border-t"
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
    const isAdmin = user?.role === "admin";
    
    try {
      setIsLoggingOut(true);
      setMobileMenuOpen(false);
      
      await logout(); 
      
      if (typeof window !== "undefined") {
        window.location.href = isAdmin ? "/404" : "/"; 
      }
    } catch (error) {
      console.error("Logout failed:", error);
      if (typeof window !== "undefined") {
        window.location.href = isAdmin ? "/404" : "/";
      }
    }
  };

  const displayUser = isLoggingOut ? null : user;

  return (
    <header className="w-full bg-white shadow-sm py-3 px-4 sm:px-6 md:px-8 relative z-50">
      
      <div className="w-full flex items-center justify-between">
        
        <div className="flex items-center gap-6">
         
          <div className="flex flex-col items-center">
            <div 
              onClick={() => router.push("/")}
              className="relative h-10 w-40 cursor-pointer font-black"
            >
              <Image
                src="/images/file_00000000d448724396c6e1ff98649aaf.png"
                alt="Logo"
                fill
                className="object-contain font-black brightness-95 contrast-125"
                priority
              />
            </div>
           
            <span className="text-xs font-medium text-slate-900 tracking-wide mt-0.5 select-none">
              <span className="text-[#035b77]">Enjoy</span>Reads
            </span>
          </div>
        </div>

        
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

        
        <button 
          className="md:hidden text-gray-700 p-1" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

    
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
*/


/*
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import {
  User,
  MapPin,
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
    // Check if user is an admin before triggering the logout actions
    const isAdmin = user?.role === "admin";
    
    try {
      setIsLoggingOut(true);
      setMobileMenuOpen(false);
      
      await logout(); 
      
      if (typeof window !== "undefined") {
        window.location.href = isAdmin ? "/404" : "/"; 
      }
    } catch (error) {
      console.error("Logout failed:", error);
      if (typeof window !== "undefined") {
        window.location.href = isAdmin ? "/404" : "/";
      }
    }
  };

  const displayUser = isLoggingOut ? null : user;

  return (
    <header className="w-full bg-white shadow-sm py-3 px-6 md:px-10 relative z-50">
      
      <div className="max-w-6xl mx-auto flex mr-15 items-center justify-between">
        
        <div className="flex items-center  gap-6">
         
          <div className="flex flex-col items-center">
            <div 
              onClick={() => router.push("/")}
              className="relative h-10 w-40 cursor-pointer font-black"
            >
              <Image
                src="/images/file_00000000d448724396c6e1ff98649aaf.png"
                alt="Logo"
                fill
                className="object-contain font-black brightness-95 contrast-125"
                priority
              />
            </div>
            
            <span className="text-xs font-medium text-slate-900 tracking-wide mt-0.5 select-none">
              <span className="text-[#035b77]">Enjoy</span>Reads
            </span>
          </div>

        </div>

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

        <button 
          className="md:hidden text-gray-700" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

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


/*
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import {
  User,
  MapPin,
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
      
      <div className="flex items-center gap-6">
        <div 
          onClick={() => router.push("/")}
          className="relative h-10 w-40 cursor-pointer"
        >
          <Image
            src="/images/file_00000000d448724396c6e1ff98649aaf.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="hidden sm:flex items-center gap-1 text-gray-500 text-sm">
          <MapPin size={16} />
          <span>Nigeria</span>
        </div>
      </div>

      
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

     
      <button 
        className="md:hidden text-gray-700" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

     
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
*/

/*
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  User,
  MapPin,
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

     
      <button 
        className="md:hidden text-gray-700" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>


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
*/

/*

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
              onClick={() => router.push("/signup")} 
              className="bg-[#035b77] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#024a61] transition"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      
      <button 
        className="md:hidden text-gray-700" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      
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
*/