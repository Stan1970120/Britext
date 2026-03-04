"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // We wrap the auth logic in useCallback to prevent unnecessary
  // effect re-runs if loginWithToken changes
  const handleAuthCallback = useCallback(async (token: string) => {
    try {
      // 1. Await the token processing in context
      await loginWithToken(token);
      
      // 2. Redirect only AFTER the state has updated
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to verify user.");
      setTimeout(() => router.replace("/auth"), 3000);
    }
  }, [loginWithToken, router]);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("No token found. Please try signing in again.");
      setTimeout(() => router.replace("/auth"), 3000);
      return;
    }

    // Call the async function
    handleAuthCallback(token);
    
  }, [searchParams, handleAuthCallback, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-2">Auth Error</h1>
            <p className="text-gray-600 text-sm">{error}</p>
          </>
        ) : (
          <>
            <div className="animate-spin h-10 w-10 border-4 border-sky-700 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-xl font-bold text-gray-800">Verifying...</h1>
            <p className="text-gray-500 text-sm">Please wait while we log you in.</p>
          </>
        )}
      </div>
    </div>
  );
}