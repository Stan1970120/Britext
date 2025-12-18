// app/layout.tsx
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
