"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "admin") {
      router.replace("/login"); // or 403 page
    }
  }, [user, loading]);

  if (loading || !user || user.role !== "admin") return null;

  return <>{children}</>;
}
