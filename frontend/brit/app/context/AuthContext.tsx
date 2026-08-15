"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { REST_API } from "../constant";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: "admin" | "user";
  provider?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    sex?: string;
  }) => Promise<{ email: string; requiresVerification: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: (redirectUrl?: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionContext = useSession();
  const session = sessionContext?.data;
  const sessionStatus = sessionContext?.status || "unauthenticated";

  // Consolidated Auth State Sync
  useEffect(() => {
    // 1. Wait until NextAuth settles its initial session check
    if (sessionStatus === "loading") {
      setLoading(true);
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      // 2. Check local credentials first
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } 
      // 3. Fallback to Google OAuth session if local state isn't present
      else if (session?.user) {
        const googleUser: User = {
          _id: (session.user as { id?: string }).id || "",
          firstName: session.user.name?.split(" ")[0] || "User",
          lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
          email: session.user.email || "",
          role: "user",
          provider: "google",
          isVerified: true,
        };
        setUser(googleUser);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to parse stored auth user:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  const saveAuth = (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwt);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (data.user && data.user.isVerified === false) {
        throw new Error("UNVERIFIED_ACCOUNT");
      }

      saveAuth(data.user, data.token);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    sex?: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      return { email: payload.email, requiresVerification: true };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP code");

      if (data.user && data.token) {
        saveAuth(data.user, data.token);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    const res = await fetch(`${REST_API}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to resend code");
  };

  const loginWithToken = async (jwtToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch user profile");

      saveAuth(data.user, jwtToken);
    } catch (err) {
      console.error("Token login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (redirectUrl: string = "/") => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (session) {
      await nextAuthSignOut({ redirect: false });
    }

    if (typeof window !== "undefined") {
      window.location.href = redirectUrl;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: loading || sessionStatus === "loading",
        login,
        signup,
        verifyOtp,
        resendOtp,
        logout,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
/*
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { REST_API } from "../constant";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: "admin" | "user";
  provider?: string;
  isVerified?: boolean; 
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    sex?: string;
  }) => Promise<{ email: string; requiresVerification: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth from localStorage on first mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const saveAuth = (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwt);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Check if user account is verified before logging in completely
      if (data.user && data.user.isVerified === false) {
        throw new Error("UNVERIFIED_ACCOUNT");
      }

      saveAuth(data.user, data.token);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    sex?: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Returns details so frontend can redirect to /verify-otp
      return { 
        email: payload.email, 
        requiresVerification: true 
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP code");

      // Save session once verified successfully
      if (data.user && data.token) {
        saveAuth(data.user, data.token);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    const res = await fetch(`${REST_API}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to resend code");
  };

  const loginWithToken = async (jwtToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API}/auth/profile`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch user profile");

      saveAuth(data.user, jwtToken);
    } catch (err) {
      console.error("Token login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        signup, 
        verifyOtp, 
        resendOtp, 
        logout, 
        loginWithToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
*/