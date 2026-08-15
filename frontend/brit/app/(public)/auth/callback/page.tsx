"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const hasProcessed = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      if (hasProcessed.current) return;

      const queryToken = searchParams.get("token");
      const redirectTarget = searchParams.get("redirect") || "/profile";

      // Case 1: Direct backend token in URL query
      if (queryToken) {
        hasProcessed.current = true;
        try {
          await loginWithToken(queryToken);
          if (isMounted) router.replace(redirectTarget);
        } catch {
          if (isMounted) {
            setError("Failed to verify user token.");
            setTimeout(() => router.replace("/auth"), 2500);
          }
        }
        return;
      }

      // Safe cast to avoid TS property existence build error
      const backendToken = (session as { backendToken?: string })?.backendToken;

      // Case 2: Token inside NextAuth session
      if (status === "authenticated" && backendToken) {
        hasProcessed.current = true;
        try {
          await loginWithToken(backendToken);
          if (isMounted) router.replace(redirectTarget);
        } catch {
          if (isMounted) {
            setError("Failed to synchronize session.");
            setTimeout(() => router.replace("/auth"), 2500);
          }
        }
        return;
      }

      // Case 3: Failed OAuth attempt
      if (status === "unauthenticated") {
        hasProcessed.current = true;
        if (isMounted) {
          setError("Authentication failed. Redirecting...");
          setTimeout(() => router.replace("/auth"), 2500);
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, session, status, loginWithToken, router]);

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


/*
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      const queryToken = searchParams.get("token");
      const redirectTarget = searchParams.get("redirect") || "/profile";

      // Case 1: Direct backend token in URL query
      if (queryToken) {
        try {
          await loginWithToken(queryToken);
          if (isMounted) router.replace(redirectTarget);
        } catch {
          if (isMounted) {
            setError("Failed to verify user token.");
            setTimeout(() => router.replace("/auth"), 2500);
          }
        }
        return;
      }

      // Case 2: Token inside NextAuth session
      if (status === "authenticated" && session?.backendToken) {
        try {
          await loginWithToken(session.backendToken);
          if (isMounted) router.replace(redirectTarget);
        } catch {
          if (isMounted) {
            setError("Failed to synchronize session.");
            setTimeout(() => router.replace("/auth"), 2500);
          }
        }
        return;
      }

      // Case 3: Failed OAuth attempt
      if (status === "unauthenticated") {
        setTimeout(() => {
          if (isMounted) {
            setError("Authentication failed. Redirecting...");
            setTimeout(() => router.replace("/auth"), 2500);
          }
        }, 0);
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, session, status, loginWithToken, router]);

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


/*
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      const queryToken = searchParams.get("token");

      // Token passed via URL query
      if (queryToken) {
        try {
          await loginWithToken(queryToken);
          if (isMounted) router.replace("/dashboard");
        } catch {
          if (isMounted) {
            setError("Failed to verify user token.");
            setTimeout(() => router.replace("/auth"), 3000);
          }
        }
        return;
      }

      // Token attached to NextAuth Session
      if (status === "authenticated" && session?.backendToken) {
        try {
          await loginWithToken(session.backendToken);
          if (isMounted) router.replace("/profile");
        } catch {
          if (isMounted) {
            setError("Failed to synchronize session.");
            setTimeout(() => router.replace("/auth"), 3000);
          }
        }
        return;
      }

      //  Unauthenticated user
      if (status === "unauthenticated") {
        setTimeout(() => {
          if (isMounted) {
            setError("Authentication failed. Redirecting...");
            setTimeout(() => router.replace("/auth"), 3000);
          }
        }, 0);
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, session, status, loginWithToken, router]);

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

/*
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
      // Await the token processing in context
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
  */