"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/context/AuthContext";
import Spinner from "./Components/Spinner";
import "./globals.css";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  useEffect(() => {
    //  Initial Page Load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const initialTimer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(initialTimer);
    }

  
    const startTimer = setTimeout(() => setLoading(true), 0);
    const stopTimer = setTimeout(() => setLoading(false), 300);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
    };
  }, [pathname]);

  return (
    <html lang="en">
      <body className="antialiased bg-white">
        <SessionProvider>
          <AuthProvider>
            {loading ? <Spinner /> : children}
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

/*
"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import Spinner from "./Components/Spinner";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState(pathname);

  // Initial loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Route change loader
  useEffect(() => {
    if (pathname !== currentPath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setCurrentPath(pathname);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath]);

  return (
    <html lang="en">
      <body className="antialiased bg-white">
        <AuthProvider>
          {loading ? <Spinner /> : children}
        </AuthProvider>
      </body>
    </html>
  );
}

*/