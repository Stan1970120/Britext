"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
}

// Context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check local storage/session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      // TODO: Replace with real API call
      // Example fake API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const fakeUser: User = {
        id: "123",
        name: "John Doe",
        email,
        role: "CLIENT", // Or "ADMIN" depending on login
      };

      // Save user to state and localStorage
      setUser(fakeUser);
      localStorage.setItem("user", JSON.stringify(fakeUser));

    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
