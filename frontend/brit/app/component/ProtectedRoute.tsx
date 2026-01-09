"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there is no user, redirect to landing
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // While checking auth, show a loading spinner
  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#035b77]" size={40} />
      </div>
    );
  }

  return <>{children}</>;
}