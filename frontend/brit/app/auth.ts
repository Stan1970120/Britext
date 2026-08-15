import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.googleId = profile.sub;
                token.email = profile.email;


                const rawBackendUrl =
                    process.env.NEXT_PUBLIC_REST_API ||
                    process.env.REST_API_URL ||
                    "https://britext.onrender.com/api";

                const backendUrl = rawBackendUrl.replace(/\/$/, "");

                try {

                    const response = await fetch(`${backendUrl}/auth/google-sync`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: profile.email,
                            firstName:
                                profile.given_name || profile.name?.split(" ")[0] || "",
                            lastName:
                                profile.family_name ||
                                profile.name?.split(" ").slice(1).join(" ") ||
                                "",
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        token.backendToken = data.token;
                    } else {
                        const errorText = await response.text();
                        console.error(
                            `Google Sync failed (${response.status}):`,
                            errorText
                        );
                    }
                } catch (error) {
                    console.error(
                        "Failed to sync Google user with Express backend:",
                        error
                    );
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
            }
            if (token.backendToken) {
                (session as { backendToken?: string }).backendToken =
                    token.backendToken as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth",
    },
});


/*
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { API } from "./constant/api";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // Runs when user logs in with Google
            if (account && profile) {
                token.googleId = profile.sub;
                token.email = profile.email;

                // Exchange Google credentials with backend to retrieve your custom Express JWT
                try {
                    const response = await fetch(API.GOOGLE_SYNC || `${process.env.NEXT_PUBLIC_REST_API}/auth/google-sync`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: profile.email,
                            firstName: profile.given_name || profile.name?.split(" ")[0] || "",
                            lastName: profile.family_name || profile.name?.split(" ")[1] || "",
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        token.backendToken = data.token;
                    }
                } catch (error) {
                    console.error("Failed to sync Google user with backend:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
            }
            if (token.backendToken) {
                (session as { backendToken?: string }).backendToken = token.backendToken as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth",
    },
});


/*
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // Runs when user logs in with Google
            if (account && profile) {
                token.googleId = profile.sub;
                token.email = profile.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth",
    },
});

/*
import NextAuth, { type User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

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
                    const rawApiBase = process.env.NEXT_PUBLIC_REST_API || "";
                    if (!rawApiBase) {
                        console.error("OAuth Error: NEXT_PUBLIC_REST_API is undefined.");
                        return false;
                    }

                    // Remove trailing slashes
                    const apiBase = rawApiBase.replace(/\/+$/, "");

                    // If NEXT_PUBLIC_REST_API already ends with /api, construct clean endpoint
                    const syncEndpoint = apiBase.endsWith("/api")
                        ? `${apiBase}/auth/google-sync`
                        : `${apiBase}/api/auth/google-sync`;

                    const res = await fetch(syncEndpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            firstName: user.name?.split(" ")[0] || "Google",
                            lastName: user.name?.split(" ").slice(1).join(" ") || "User",
                            image: user.image,
                            provider: "google",
                        }),
                    });

                    if (!res.ok) {
                        const errorDetails = await res.text();
                        console.error(`Backend OAuth sync failed (${res.status}) at ${syncEndpoint}:`, errorDetails);
                        return false;
                    }

                    const data = await res.json();
                    if (data?.token) {
                        (user as User).backendToken = String(data.token);
                    }

                    return true;
                } catch (error) {
                    console.error("Backend OAuth Sync Exception:", error);
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
*/