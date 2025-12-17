"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Spinner from "./Components/Spinner";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState(pathname);

  // Initial loader (5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Detect route changes for loader
  useEffect(() => {
    if (pathname !== currentPath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setCurrentPath(pathname);
      }, 500); // minimal spinner display for route change
      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath]);

  return (
    <html lang="en">
      <body className="antialiased bg-white">
        <AuthProvider>
          {loading ? (
            <Spinner />
          ) : (
            <>
              <Header />
              {children}
              <Footer />
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
