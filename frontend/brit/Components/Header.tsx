"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  MapPin,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const Header = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Debounced search suggestions
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        const mockData = [
          "Advanced Physics",
          "Basic Chemistry",
          "Modern Mathematics",
          "Introduction to Literature",
          "History of Africa",
          "Computer Science Principles",
        ];
        const filtered = mockData.filter((book) =>
          book.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    }, 200); // wait 200ms after typing before updating

    return () => clearTimeout(timeout); // cleanup old timers
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    router.push(`/search?query=${encodeURIComponent(suggestion)}`);
    setSuggestions([]);
  };

  return (
    <header className="w-full bg-white shadow-sm py-3 px-4 md:px-10 flex items-center justify-between relative z-50">
      {/* LEFT SECTION: LOGO + LOCATION */}
      <div className="flex items-center gap-6">
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-black cursor-pointer"
        >
          Enjoy<span className="text-[#035b77]">Reads</span>
        </h1>

        <div className="hidden sm:flex items-center gap-1 text-gray-600 text-sm cursor-pointer">
          <MapPin size={16} />
          <span>Nigeria</span>
        </div>
      </div>

      {/* CENTER SECTION: SEARCH + CATEGORY (Desktop) */}
      <div className="hidden md:flex flex-col w-[45%] relative">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-gray-100 rounded-full overflow-hidden"
        >
          <button
            type="button"
            className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            All Categories
            <ChevronDown size={16} />
          </button>

          <div className="flex items-center flex-1 bg-white rounded-r-full px-4 py-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for book"
              className="w-full bg-transparent focus:outline-none text-sm px-2"
            />
          </div>
        </form>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white shadow-md rounded-lg mt-1 border border-gray-100 max-h-60 overflow-y-auto z-50">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(item)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RIGHT SECTION: ICONS */}
      <div className="hidden md:flex items-center gap-6 text-gray-700 text-sm">
        <button
          onClick={() => router.push("/saved")}
          className="flex items-center gap-1 hover:text-[#035b77] transition"
        >
          <Heart size={18} />
          <span>Saved</span>
        </button>

        <button
          onClick={() => router.push("/checkout")}
          className="relative flex items-center gap-1 hover:text-[#035b77] transition"
        >
          <ShoppingCart size={18} />
          <span>Checkout</span>
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-semibold rounded-full px-[5px] py-[1px] translate-x-2 -translate-y-2">
            1
          </span>
        </button>

        <button
          onClick={() => router.push("/auth")}
          className="flex items-center gap-1 hover:text-[#035b77] transition"
        >
          <User size={18} />
          <span>Login</span>
        </button>
      </div>

      {/* MOBILE MENU TOGGLE */}
      <button
        className="md:hidden text-gray-700 hover:text-[#035b77] transition"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-md flex flex-col items-start px-6 py-4 space-y-4 md:hidden animate-slide-down">
          <form
            onSubmit={handleSearch}
            className="flex items-center w-full bg-gray-100 rounded-full overflow-hidden px-4 py-2 relative"
          >
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for book"
              className="w-full bg-transparent focus:outline-none text-sm px-2"
            />
          </form>

          {/* Mobile Search Suggestions */}
          {suggestions.length > 0 && (
            <ul className="w-full bg-white shadow-md rounded-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    handleSelectSuggestion(item);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => {
              router.push("/saved");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-gray-700 hover:text-[#035b77] transition"
          >
            <Heart size={18} /> Saved
          </button>

          <button
            onClick={() => {
              router.push("/checkout");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-gray-700 hover:text-[#035b77] transition"
          >
            <ShoppingCart size={18} /> Checkout
          </button>

          <button
            onClick={() => {
              router.push("/auth");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-gray-700 hover:text-[#035b77] transition"
          >
            <User size={18} /> Login
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;