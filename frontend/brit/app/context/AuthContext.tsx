"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { REST_API } from "../constant";
import { API } from "../constant/api"; 

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
  loginWithToken: (tokenOrPayload: string | { email: string; firstName?: string; lastName?: string }) => Promise<void>;
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
  const isSyncingGoogle = useRef(false);

  const saveAuth = (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwt);
  };

  useEffect(() => {
    if (sessionStatus === "loading") {
      setLoading(true);
      return;
    }

    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } else if (session?.user && !isSyncingGoogle.current) {
          isSyncingGoogle.current = true;
          const firstName = session.user.name?.split(" ")[0] || "Google";
          const lastName = session.user.name?.split(" ").slice(1).join(" ") || "User";
          const email = session.user.email || "";

          if (email) {
            const targetEndpoint = API.GOOGLE_SYNC || `${REST_API}/auth/google-sync`;
            const res = await fetch(targetEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, firstName, lastName, provider: "google" }),
            });

            if (res.ok) {
              const data = await res.json();
              saveAuth(data.user, data.token);
            }
          }
        } else if (!session?.user && !storedToken) {
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
    };

    initAuth();
  }, [session, sessionStatus]);

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

  const loginWithToken = async (
    tokenOrPayload: string | { email: string; firstName?: string; lastName?: string }
  ) => {
    setLoading(true);
    try {
      const targetEndpoint = API.GOOGLE_SYNC || `${REST_API}/auth/google-sync`;
      const bodyPayload =
        typeof tokenOrPayload === "string"
          ? { token: tokenOrPayload }
          : tokenOrPayload;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (typeof tokenOrPayload === "string") {
        headers["Authorization"] = `Bearer ${tokenOrPayload}`;
      }

      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify session");

      const activeToken = data.token || (typeof tokenOrPayload === "string" ? tokenOrPayload : "");
      const userData = data.user || data;

      saveAuth(userData, activeToken);
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

    try {
      await fetch(`${REST_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to clear backend auth cookie:", err);
    }

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
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { REST_API } from "../constant";
import { API } from "../constant/api"; 
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

  useEffect(() => {
    if (sessionStatus === "loading") {
      setLoading(true);
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else if (session?.user) {
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
      // Use API.GOOGLE_SYNC or fallback directly to sync verification endpoint
      const targetEndpoint = API.GOOGLE_SYNC || `${REST_API}/auth/google-sync`;

      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Auth sync returned invalid content type (${res.status} ${res.statusText})`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify token session");

      saveAuth(data.user || data, jwtToken);
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
*/