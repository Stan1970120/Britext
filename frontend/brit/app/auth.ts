import NextAuth, { type User, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

interface CustomUser extends User {
    backendToken?: string;
}

interface CustomSession extends Session {
    backendToken?: string;
}

interface CustomJWT extends JWT {
    backendToken?: string;
    accessToken?: string;
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
                        return true;
                    }

                    const apiBase = rawApiBase.replace(/\/+$/, "");
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

                    if (res.ok) {
                        const data = (await res.json()) as { token?: string };
                        if (data?.token) {
                            const customUser = user as CustomUser;
                            customUser.backendToken = String(data.token);
                        }
                    }
                } catch (error) {
                    console.error("Backend OAuth Sync Exception:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            const customToken = token as CustomJWT;
            if (account) {
                customToken.accessToken = account.access_token;
            }
            const customUser = user as CustomUser | undefined;
            if (customUser?.backendToken) {
                customToken.backendToken = customUser.backendToken;
            }
            return customToken;
        },
        async session({ session, token }) {
            const customSession = session as CustomSession;
            const customToken = token as CustomJWT;
            if (typeof customToken.backendToken === "string") {
                customSession.backendToken = customToken.backendToken;
            }
            return customSession;
        },
    },
});