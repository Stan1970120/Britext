import NextAuth, { type User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Importing JWT directly allows module augmentation for 'next-auth/jwt'
import type { JWT } from "next-auth/jwt";

// Type augmentation for NextAuth module
declare module "next-auth" {
    interface User {
        backendToken?: string;
    }
    interface Session {
        backendToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        accessToken?: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_REST_API || "";
                    const res = await fetch(`${apiBase}/auth/google-sync`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            firstName: user.name?.split(" ")[0] || "",
                            lastName: user.name?.split(" ").slice(1).join(" ") || "",
                            image: user.image,
                            provider: "google",
                        }),
                    });

                    if (!res.ok) {
                        console.error("Backend sync responded with status:", res.status);
                        return false;
                    }

                    const data = await res.json();
                    if (data?.token) {
                        (user as User).backendToken = String(data.token);
                    }

                    return true;
                } catch (error) {
                    console.error("Backend OAuth Sync Error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            const customUser = user as User | undefined;
            if (customUser?.backendToken) {
                token.backendToken = customUser.backendToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (typeof token.backendToken === "string") {
                session.backendToken = token.backendToken;
            }
            return session;
        },
    },
});