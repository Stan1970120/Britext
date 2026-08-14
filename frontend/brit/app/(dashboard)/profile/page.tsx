
"use client";

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Bookmark, 
  History, 
  ShoppingBag, 
  BookOpen,
  ChevronRight,
  Library
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import Header from "@/Components/Header"; 
import { REST_API } from "../../constant";

// Define a clear Interface for your User to fix the .id error
interface AppUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

type Tab = "my-books" | "saved" | "history";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

export default function UserDashboard() {
  // 2. Cast the user from useAuth to your AppUser type
  const { user, loading: authLoading } = useAuth() as { 
    user: AppUser | null; 
    loading: boolean 
  };

  const [activeTab, setActiveTab] = useState<Tab>("my-books");
  const [ownedBooks, setOwnedBooks] = useState<Book[]>([]);
  const [fetchingBooks, setFetchingBooks] = useState(false);

  useEffect(() => {
    const fetchMyBooks = async () => {
      // Check for user.id safely
      if (!user?.id) return;
      
      try {
        setFetchingBooks(true);
        const response = await fetch(`${REST_API}/users/${user.id}/books`);
        
        if (response.ok) {
          // 3. Avoid 'any' by typing the response data
          const data: Book[] = await response.json();
          setOwnedBooks(data);
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setFetchingBooks(false);
      }
    };

    if (activeTab === "my-books") {
      fetchMyBooks();
    }
  }, [user?.id, activeTab]);

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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white p-6 md:p-12 lg:px-24">
       
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Account</h1>
            <p className="text-slate-500 font-medium">Manage your library and preferences</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link 
              href="/book-store" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all"
            >
              <BookOpen size={18} /> Store
            </Link>
            <Link 
              href="/checkout" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-100"
            >
              <ShoppingBag size={18} /> Cart
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-3 space-y-2">
            {(["my-books", "saved", "history"] as Tab[]).map((tab) => (
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
                {tab === "saved" && <Bookmark size={20} />}
                {tab === "history" && <History size={20} />}
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>

          
          <div className="lg:col-span-9">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[500px]">
              {activeTab === "my-books" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                  <h2 className="text-xl font-black text-slate-900 mb-8">My Library</h2>
                  
                  {fetchingBooks ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-3" />
                          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                        </div>
                      ))}
                    </div>
                  ) : ownedBooks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                      <Link href="/book-store" className="bg-[#005F7A] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                        Explore Books
                      </Link>
                    </div>
                  )}
                </div>
              )}

              
              {activeTab !== "my-books" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    {activeTab === "saved" ? <Bookmark size={32} /> : <History size={32} />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {activeTab === "saved" ? "Your wishlist is empty" : "No orders yet"}
                  </h3>
                  <Link href="/book-store" className="text-sky-600 font-bold mt-4 hover:underline">
                    Visit Store <ChevronRight size={16} className="inline" />
                  </Link>
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
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  Bookmark, 
  History, 
  LogOut, 
  ShoppingBag, 
  BookOpen,
  ChevronRight,
  Library
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import Header from "@/Components/Header"; 
import { REST_API } from "../../constant";

// 1. Define a clear Interface for your User to fix the .id error
interface AppUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

type Tab = "my-books" | "saved" | "history";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  
  // 2. Cast the user from useAuth to your AppUser type
  const { user, logout, loading: authLoading } = useAuth() as { 
    user: AppUser | null; 
    logout: () => void; 
    loading: boolean 
  };

  const [activeTab, setActiveTab] = useState<Tab>("my-books");
  const [ownedBooks, setOwnedBooks] = useState<Book[]>([]);
  const [fetchingBooks, setFetchingBooks] = useState(false);

  useEffect(() => {
    const fetchMyBooks = async () => {
      // Check for user.id safely
      if (!user?.id) return;
      
      try {
        setFetchingBooks(true);
        const response = await fetch(`${REST_API}/users/${user.id}/books`);
        
        if (response.ok) {
          // 3. Avoid 'any' by typing the response data
          const data: Book[] = await response.json();
          setOwnedBooks(data);
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setFetchingBooks(false);
      }
    };

    if (activeTab === "my-books") {
      fetchMyBooks();
    }
  }, [user?.id, activeTab]);

  const handleLogout = () => {
    logout();
    router.push("/auth");
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white p-6 md:p-12 lg:px-24">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Account</h1>
            <p className="text-slate-500 font-medium">Manage your library and preferences</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link 
              href="/book-store" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all"
            >
              <BookOpen size={18} /> Store
            </Link>
            <Link 
              href="/checkout" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-100"
            >
              <ShoppingBag size={18} /> Cart
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-3 space-y-2">
            {(["my-books", "saved", "history"] as Tab[]).map((tab) => (
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
                {tab === "saved" && <Bookmark size={20} />}
                {tab === "history" && <History size={20} />}
                {tab.replace("-", " ")}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>

          
          <div className="lg:col-span-9">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[500px]">
              {activeTab === "my-books" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                  <h2 className="text-xl font-black text-slate-900 mb-8">My Library</h2>
                  
                  {fetchingBooks ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-3" />
                          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                        </div>
                      ))}
                    </div>
                  ) : ownedBooks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                      <Link href="/book-store" className="bg-[#005F7A] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                        Explore Books
                      </Link>
                    </div>
                  )}
                </div>
              )}

              
              {activeTab !== "my-books" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    {activeTab === "saved" ? <Bookmark size={32} /> : <History size={32} />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {activeTab === "saved" ? "Your wishlist is empty" : "No orders yet"}
                  </h3>
                  <Link href="/book-store" className="text-sky-600 font-bold mt-4 hover:underline">
                    Visit Store <ChevronRight size={16} className="inline" />
                  </Link>
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

/*
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
  ChevronRight,
  Mail,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

type Tab = "personal" | "saved" | "history";

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  if (loading) {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-md">
          <User className="mx-auto text-gray-300 mb-4" size={48} />
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

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:px-24">
     
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Account</h1>
          <p className="text-slate-500 font-medium">Manage your preferences</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link 
            href="/book-store" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all"
          >
            <BookOpen size={18} /> Store
          </Link>
          <Link 
            href="/checkout" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-100"
          >
            <ShoppingBag size={18} /> Cart
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
       
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab("personal")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === "personal" 
              ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
              : "text-slate-500 hover:bg-slate-100/50"
            }`}
          >
            <User size={20} /> Personal Info
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === "saved" 
              ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
              : "text-slate-500 hover:bg-slate-100/50"
            }`}
          >
            <Bookmark size={20} /> Saved for Later
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === "history" 
              ? "bg-[#005F7A] text-white shadow-lg shadow-sky-50" 
              : "text-slate-500 hover:bg-slate-100/50"
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

        
        <div className="lg:col-span-9">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[500px]">
            {activeTab === "personal" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-black text-slate-900 mb-8">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">First Name</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-3">
                      <User size={16} className="text-slate-400" /> {user.firstName}
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
                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-3">
                      <Mail size={16} className="text-slate-400" /> {user.email}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Account Role</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-3">
                      <ShieldCheck size={16} className="text-[#005F7A]" /> 
                      <span className="capitalize">{user.role || "User"}</span>
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
*/