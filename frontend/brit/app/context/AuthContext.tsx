"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  _id: string; // match backend
  firstName: string;
  lastName: string;
  email: string;
  role?: "admin" | "user"; // match backend
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setLoading: (val: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { firstName: string; lastName: string; email: string; password: string; sex?: string }) => Promise<void>;
  logout: () => void;
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    saveAuth(data.user, data.token);
    setLoading(false);
  };

  const signup = async (payload: { firstName: string; lastName: string; email: string; password: string; sex?: string }) => {
  setLoading(true);
  const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API}/auth/signup`, {  // ✅ corrected
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  saveAuth(data.user, data.token);
  setLoading(false);
};

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};