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
  }) => Promise<void>;
  logout: () => Promise<void>;
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
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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

      saveAuth(data.user, data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // 1. Notify backend to clear secure cookies
      await fetch(`${REST_API}/auth/logout`, { 
        method: "POST", 
        credentials: "include" 
      });
    } catch (err) {
      console.error("Logout backend sync failed:", err);
    } finally {
      // 2. Clear Local State
      setUser(null);
      setToken(null);
      
      // 3. Clear Storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};