"use client";

import { useAuth } from "@/app/context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const useUser = () => {
    const { user, token, login, signup, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    /**
     * Protect pages that require authentication
     */
    const requireAuth = (redirectPath = "/signin") => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (!user) {
                router.replace(`${redirectPath}?redirect=${pathname}`);
            }
        }, [user, router, pathname, redirectPath]);
    };

    return {
        user,
        token,
        login,
        signup,
        logout,
        requireAuth,
    };
};
