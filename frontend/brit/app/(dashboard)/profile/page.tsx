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
import { REST_API } from "../../constant";
import { API } from "../../constant/api";
import BookStore from "@/app/(public)/book-store/page";

// Types
interface AppUser {
  id?: string;
  _id?: string;
  email?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

type Tab = "my-books" | "store" | "cart" | "saved" | "history";

interface Book {
  id?: string;
  _id?: string;
  title: string;
  author?: string;
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

  // Helper to resolve user identifier safely across backend schemas
  const userId = user?.id || user?._id;

  // Fetch My Books
  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!userId) return;
      
      try {
        setFetchingBooks(true);
        const response = await fetch(`${REST_API}/users/${userId}/books`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Handle both array response and wrapped { purchasedBooks: [...] } response
          const booksList = Array.isArray(data)
            ? data
            : Array.isArray(data?.purchasedBooks)
            ? data.purchasedBooks
            : [];

          setOwnedBooks(booksList);
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
  }, [userId, activeTab]);

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

  // 1. Loading State Guard
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

  // 2. Unauthenticated Guard
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-md">
          <UserIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">Please log in to your account to view your dashboard and orders.</p>
          <Link 
            href="/auth" 
            className="block w-full bg-[#005F7A] text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-100 hover:scale-[1.02] transition-transform"
          >
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  // 3. Main Dashboard UI
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
                    ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
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
                      {ownedBooks.map((book, index) => (
                        <div key={book.id || book._id || index} className="group cursor-pointer">
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
                      <div className="w-16 h-16 bg-[#005F7A]/10 rounded-full flex items-center justify-center text-[#005F7A] mb-4">
                        <BookOpen size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Your shelf is empty</h3>
                      <p className="text-slate-500 mt-2 mb-6">You haven&apos;t purchased any books yet.</p>
                      <button 
                        onClick={() => setActiveTab("store")}
                        className="bg-[#005F7A] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
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
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-[#005F7A] rounded-full animate-spin"></div>
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
                                <p className="text-sm font-semibold text-[#005F7A]">${item.book?.price}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              {/* Quantity Control */}
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

                              {/* Delete */}
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

                      {/* Cart Footer */}
                      <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Subtotal</p>
                          <p className="text-2xl font-black text-slate-900">${calculateSubtotal().toFixed(2)}</p>
                        </div>
                        <Link 
                          href="/checkout"
                          className="w-full sm:w-auto bg-[#005F7A] text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity text-center shadow-lg shadow-sky-50"
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
                        className="bg-[#005F7A] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
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
import { REST_API } from "../../constant";
import { API } from "../../constant/api";
import BookStore from "@/app/(public)/book-store/page";

// Types
interface AppUser {
  id?: string;
  _id?: string;
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

  // Helper to resolve user identifier safely across backend schemas
  const userId = user?.id || user?._id;

  // Fetch My Books
  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!userId) return;
      
      try {
        setFetchingBooks(true);
        const response = await fetch(`${REST_API}/users/${userId}/books`);
        
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
  }, [userId, activeTab]);

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

  // 1. Loading State Guard
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

  // 2. Unauthenticated Guard
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-md">
          <UserIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">Please log in to your account to view your dashboard and orders.</p>
          <Link 
            href="/auth" 
            className="block w-full bg-[#005F7A] text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-100 hover:scale-[1.02] transition-transform"
          >
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  // 3. Main Dashboard UI
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white p-6 md:p-12 lg:px-24">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Account</h1>
            <p className="text-slate-500 font-medium">Manage your library and preferences</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            
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
          
          {isSidebarOpen && (
            <div className="lg:col-span-3 space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
              {(["my-books", "store", "cart", "saved", "history"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all capitalize ${
                    activeTab === tab 
                    ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
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

          
          <div className={isSidebarOpen ? "lg:col-span-9" : "lg:col-span-12"}>
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm min-h-[500px]">
              
             
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
                      <div className="w-16 h-16 bg-[#005F7A]/10 rounded-full flex items-center justify-center text-[#005F7A] mb-4">
                        <BookOpen size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Your shelf is empty</h3>
                      <p className="text-slate-500 mt-2 mb-6">You haven&apos;t purchased any books yet.</p>
                      <button 
                        onClick={() => setActiveTab("store")}
                        className="bg-[#005F7A] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                      >
                        Explore Store
                      </button>
                    </div>
                  )}
                </div>
              )}

              
              {activeTab === "store" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <BookStore />
                </div>
              )}

              
              {activeTab === "cart" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-black text-slate-900 mb-6">Your Cart</h2>
                  
                  {loadingCart ? (
                    <div className="flex justify-center items-center py-16">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-[#005F7A] rounded-full animate-spin"></div>
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
                                <p className="text-sm font-semibold text-[#005F7A]">${item.book?.price}</p>
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
                          className="w-full sm:w-auto bg-[#005F7A] text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity text-center shadow-lg shadow-sky-50"
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
                        className="bg-[#005F7A] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                      >
                        Explore Store
                      </button>
                    </div>
                  )}
                </div>
              )}

              
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

*/