"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./context";
import Spinner from "./Components/Spinner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip loader on initial page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Defer state update to next microtask/frame to prevent synchronous cascading renders
    const startTimer = setTimeout(() => {
      setLoading(true);
    }, 0);

    const stopTimer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
    };
  }, [pathname]);

  return (
    <SessionProvider>
      <AuthProvider>
        {/* Show loading overlay without unmounting children */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <Spinner />
          </div>
        )}
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}